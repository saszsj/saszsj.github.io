const { createHash } = require('node:crypto');

const OWNER_EMAIL = 'zhan.shengjie@gmail.com';

function isValidEmail(value) {
  if (typeof value !== 'string' || value.length > 254 || /[\s\x00-\x1f\x7f]/u.test(value)) return false;
  const parts = value.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  const domainLabels = domain.split('.');
  return local.length <= 64 &&
    /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/i.test(local) &&
    domainLabels.length >= 2 &&
    domainLabels.every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label));
}

async function sendSiteMail(kind, requestId, message) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.ZSJ_QUOTE_FROM?.trim();
  const errorPrefix = kind === 'quote' ? 'quote_mail' : 'application_mail';
  if (!apiKey || !isValidEmail(from)) throw new Error(errorPrefix + '_unconfigured');
  const key = createHash('sha256').update(requestId).digest('hex');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
      'Idempotency-Key': 'zsj-' + kind + '/' + key,
    },
    body: JSON.stringify({ from, ...message }),
    redirect: 'error',
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(errorPrefix + '_unavailable');
  const result = await response.json();
  if (typeof result?.id !== 'string' || !result.id) throw new Error(errorPrefix + '_unavailable');
}

module.exports = { OWNER_EMAIL, isValidEmail, sendSiteMail };
