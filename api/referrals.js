const { isIP } = require('node:net');
const { isAllowedOrigin } = require('./_lib/site-origin.cjs');
const store = require('./_lib/referral-store.cjs');
const { sendApplicationAlert, sendApplicationConfirmation } = require('./_lib/partner-application-mail.cjs');
const { PARTNER_ID, readSession, setSession, validAdminPassword, loginRateKey, verifyLeadReceipt } = require('./_lib/referral-session.cjs');

const UUID = /^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i;
const validId = value => typeof value === 'string' && PARTNER_ID.test(value);
const validUuid = value => typeof value === 'string' && UUID.test(value);

async function attemptAllowed(request, role, limit = 15, windowSeconds = 300) {
  const forwarded = request.headers['x-vercel-forwarded-for'];
  const address = typeof forwarded === 'string' && isIP(forwarded) ? forwarded : request.socket?.remoteAddress || 'unknown';
  return store.consumeLoginAttempt(loginRateKey(role, address), limit, windowSeconds);
}

// The submission or approval is durable before mail is attempted. Only the owner
// can retry confirmations, and retries use the same partner and provider key.
async function notifyApplication(application, kind, partner) {
  const sentField = kind === 'alert' ? 'alertSent' : 'confirmationSent';
  if (application[sentField]) return application;
  try {
    const lease = await store.claimApplicationMail(application.id, kind);
    if (!lease) return await store.getApplication(application.id) || application;
    try {
      if (kind === 'alert') await sendApplicationAlert(application);
      else await sendApplicationConfirmation(application, partner);
    } catch {
      await store.finishApplicationMail(application.id, kind, lease, false);
      return application;
    }
    if (await store.finishApplicationMail(application.id, kind, lease, true)) {
      return { ...application, [sentField]: true };
    }
  } catch {
    // The dashboard keeps the pending delivery available for a retry.
  }
  return application;
}

module.exports = async function referrals(request, response) {
  response.setHeader('Cache-Control', 'private, no-store');
  response.setHeader('Vary', 'Cookie, Origin');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  const error = (status, code) => response.status(status).json({ error: code });
  const ok = (data = { ok: true }) => response.status(200).json(data);

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return error(405, 'method_not_allowed');
  }
  if (!isAllowedOrigin(request)) return error(403, 'origin_not_allowed');
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers['content-type'] || '') ||
      Number(request.headers['content-length']) > 4096) return error(400, 'invalid_request');

  let body;
  try {
    body = request.body;
    if (!body || typeof body !== 'object' || Buffer.byteLength(JSON.stringify(body)) > 4096) return error(400, 'invalid_request');
  } catch {
    return error(400, 'invalid_request');
  }

  try {
    switch (body.action) {
      case 'apply': {
        if (!await attemptAllowed(request, 'applications', 8, 600)) {
          response.setHeader('Retry-After', '600');
          return error(429, 'rate_limited');
        }
        const application = await store.submitApplication({ name: body.name, email: body.email, locale: body.locale });
        if (application.status === 'pending') await notifyApplication(application, 'alert');
        return response.status(202).json({ ok: true });
      }
      case 'admin_login':
      case 'partner_login': {
        const admin = body.action === 'admin_login';
        const role = admin ? 'admin' : 'partner';
        if (admin && (typeof body.password !== 'string' || body.password.length > 512)) return error(400, 'invalid_request');
        if (!admin && (typeof body.code !== 'string' || body.code.length > 128 ||
            (body.id !== undefined && !validId(body.id)))) return error(400, 'invalid_request');
        if (!await attemptAllowed(request, role)) {
          response.setHeader('Retry-After', '300');
          return error(429, 'rate_limited');
        }
        if (admin) {
          if (!validAdminPassword(body.password)) return error(401, 'invalid_credentials');
          setSession(request, response, role, 'owner');
          return ok();
        }
        const partner = await store.getPartner(body.code, body.id);
        if (!partner) return error(401, 'invalid_credentials');
        setSession(request, response, role, partner.id);
        return ok({ partner });
      }
      case 'admin_list':
      case 'admin_approve':
      case 'admin_retry_mail':
      case 'admin_reconcile':
      case 'admin_create': {
        if (!readSession(request, 'admin')) return error(401, 'unauthorized');
        if (body.action === 'admin_list') {
          const [partners, applications] = await Promise.all([store.listPartners(), store.listApplications()]);
          return ok({ partners, applications });
        }
        if (body.action === 'admin_approve' || body.action === 'admin_retry_mail') {
          if (!validId(body.id)) return error(400, 'invalid_request');
          const kind = body.action === 'admin_approve' ? 'confirmation' : body.kind;
          if (!['alert', 'confirmation'].includes(kind)) return error(400, 'invalid_request');
          let application = await store.getApplication(body.id);
          if (!application) return error(404, 'unknown_application');
          if (body.action === 'admin_retry_mail' && application.status !== (kind === 'alert' ? 'pending' : 'approved')) {
            return error(409, 'invalid_application_state');
          }
          let partner;
          if (kind === 'confirmation') {
            const approved = await store.approveApplication(body.id);
            if (!approved) return error(404, 'unknown_application');
            ({ application, partner } = approved);
          }
          application = await notifyApplication(application, kind, partner);
          const sent = kind === 'alert' ? application.alertSent : application.confirmationSent;
          return ok({ application, mailStatus: sent ? 'sent' : 'pending' });
        }
        if (body.action === 'admin_reconcile') {
          const receipt = verifyLeadReceipt(body.receipt);
          if (!receipt) return error(400, 'invalid_request');
          if (!await store.getPartnerStats(receipt.id)) return error(404, 'unknown_partner');
          const added = await store.recordLead(receipt.id, receipt.leadKey);
          return ok({ partnerId: receipt.id, added });
        }
        if (!validUuid(body.requestId) || typeof body.name !== 'string' || !body.name.trim()) return error(400, 'invalid_request');
        return ok({ partner: await store.createPartner(body.name.trim(), body.requestId) });
      }
      case 'partner_stats': {
        const id = readSession(request, 'partner');
        if (!id || (body.id !== undefined && body.id !== id)) return error(401, 'unauthorized');
        const partner = await store.getPartnerStats(id);
        return partner ? ok({ partner }) : error(404, 'unknown_partner');
      }
      case 'visit': {
        if (!validId(body.id) || !validUuid(body.visitorId)) return error(400, 'invalid_request');
        const existing = readSession(request, 'attribution');
        if (existing) return ok({ ok: true, id: existing });
        const assigned = await store.assignVisit(body.id, body.visitorId);
        if (!assigned) return error(404, 'unknown_partner');
        setSession(request, response, 'attribution', assigned);
        return ok({ ok: true, id: assigned });
      }
      case 'admin_logout':
      case 'partner_logout':
      case 'forget': {
        const cookie = { admin_logout: 'admin', partner_logout: 'partner', forget: 'attribution' }[body.action];
        setSession(request, response, cookie, null);
        return ok();
      }
      default: return error(400, 'invalid_request');
    }
  } catch (failure) {
    if (failure.code === 'invalid_request') return error(400, 'invalid_request');
    if (failure.code === 'idempotency_conflict') return error(409, 'invalid_request');
    return error(503, 'unavailable');
  }
};
