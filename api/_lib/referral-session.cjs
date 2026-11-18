const { createHmac, createHash, timingSafeEqual } = require('node:crypto');

const PARTNER_ID = /^[a-f0-9]{32}$/;
const cookies = {
  admin: { name: 'zsj_ref_admin', path: '/api/referrals', seconds: 8 * 3600 },
  partner: { name: 'zsj_ref_partner', path: '/api/referrals', seconds: 8 * 3600 },
  attribution: { name: 'zsj_ref_source', path: '/api', seconds: 30 * 24 * 3600 },
};

function secret() {
  const key = process.env.ZSJ_REFERRAL_SECRET;
  if (!key || Buffer.byteLength(key) < 32) throw new Error('referrals_unconfigured');
  return key;
}

function administratorPassword() {
  const password = process.env.ZSJ_REFERRAL_ADMIN_PASSWORD;
  if (!password || password.length < 16) throw new Error('admin_unconfigured');
  return password;
}

function equalStrings(a, b) {
  const hash = value => createHash('sha256').update(value).digest();
  return timingSafeEqual(hash(a), hash(b));
}

function validAdminPassword(attempt) {
  return equalStrings(administratorPassword(), attempt);
}

function mac(purpose, value) {
  // A password change also expires existing administrator sessions.
  const signer = createHmac('sha256', secret()).update('zsj/referrals/v1/' + purpose + '\0');
  if (purpose === 'admin') signer.update(administratorPassword()).update('\0');
  return signer.update(value).digest('base64url');
}

function cookieValue(request, name) {
  const header = request.headers.cookie || '';
  return header.split(';').map(item => item.trim()).find(item => item.startsWith(name + '='))?.slice(name.length + 1);
}

function readSession(request, purpose) {
  const value = cookieValue(request, cookies[purpose].name);
  if (!value || value.length > 160) return null;
  const [id, expires, signature, extra] = value.split('.');
  if (extra !== undefined || !(purpose === 'admin' ? id === 'owner' : PARTNER_ID.test(id)) ||
      !/^\d{10}$/.test(expires) || Number(expires) <= Math.floor(Date.now() / 1000) ||
      !/^[A-Za-z0-9_-]{43}$/.test(signature || '')) return null;
  const expected = mac(purpose, id + '.' + expires);
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature)) ? id : null;
}

function setSession(request, response, purpose, id) {
  const { name, path, seconds } = cookies[purpose];
  let value = '';
  if (id) {
    const payload = id + '.' + (Math.floor(Date.now() / 1000) + seconds);
    value = payload + '.' + mac(purpose, payload);
  }
  const secure = request.headers.origin?.startsWith('https://') ? '; Secure' : '';
  response.setHeader('Set-Cookie', name + '=' + value + '; Path=' + path + '; HttpOnly; SameSite=Strict; Max-Age=' + (id ? seconds : 0) + secure);
}

function leadKeyForEmail(email) {
  return mac('lead-email', email.trim().toLowerCase());
}

// Only the consultant receives this link. Opening it in an authenticated admin
// session can replay the same deduplicated write even after a storage outage.
function createLeadReceipt(id, email) {
  const fields = id + '.' + leadKeyForEmail(email);
  return fields + '.' + mac('delivered-lead', fields);
}

function verifyLeadReceipt(receipt) {
  if (typeof receipt !== 'string' || !/^[a-f0-9]{32}\.[\w-]{43}\.[\w-]{43}$/.test(receipt)) return null;
  const [id, leadKey, signature] = receipt.split('.');
  const expected = mac('delivered-lead', id + '.' + leadKey);
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature)) ? { id, leadKey } : null;
}

module.exports = {
  PARTNER_ID, readSession, setSession, validAdminPassword, leadKeyForEmail, createLeadReceipt, verifyLeadReceipt,
  getAttribution: request => readSession(request, 'attribution'),
  loginRateKey: (role, address) => mac('login-rate/' + role, address),
};
