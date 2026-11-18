const { createHash, randomBytes } = require('node:crypto');
const { isValidEmail } = require('./mail-transport.cjs');

// All keys in each script share a Redis Cluster hash slot.
const PREFIX = 'zsj:{referrals}:';
const PARTNERS = PREFIX + 'partners';
const APPLICATIONS = PREFIX + 'applications';
const PUBLIC_ID = /^[a-f0-9]{32}$/;
const ACCESS_CODE = /^[A-Za-z0-9_-]{43}$/;
const PUBLIC_FIELDS = ['name', 'createdAt', 'visitors', 'leads'];
const OWNER_FIELDS = [...PUBLIC_FIELDS, 'accessCode'];
const APPLICATION_FIELDS = ['name', 'email', 'locale', 'status', 'createdAt', 'partnerId', 'alertSent', 'confirmationSent'];
const APPLICATION_LOCALES = new Set(['fr', 'en', 'it', 'zh-CN']);

const CREATE = `
  if ARGV[6] == 'approval' then
    if redis.call('EXISTS', KEYS[4]) == 0 then return false end
    local prior = redis.call('HGET', KEYS[4], 'partnerId')
    if prior then return prior end
  elseif KEYS[4] then
    local prior = redis.call('GET', KEYS[4])
    if prior then return prior end
  end
  if redis.call('EXISTS', KEYS[1], KEYS[2]) > 0 then return '' end
  redis.call('HSET', KEYS[1], 'name', ARGV[2], 'createdAt', ARGV[3],
    'accessCode', ARGV[4], 'visitors', 0, 'leads', 0)
  redis.call('SET', KEYS[2], ARGV[1])
  redis.call('ZADD', KEYS[3], ARGV[5], ARGV[1])
  if ARGV[6] == 'approval' then
    redis.call('HSET', KEYS[4], 'status', 'approved', 'partnerId', ARGV[1])
  elseif KEYS[4] then
    redis.call('SET', KEYS[4], ARGV[1])
  end
  return ARGV[1]
`;

const SUBMIT_APPLICATION = `
  local prior = redis.call('GET', KEYS[2])
  if prior then return prior end
  if redis.call('EXISTS', KEYS[1]) == 1 then return '' end
  redis.call('HSET', KEYS[1], 'name', ARGV[2], 'email', ARGV[3], 'locale', ARGV[4],
    'createdAt', ARGV[5], 'status', 'pending', 'alertSent', 0, 'confirmationSent', 0)
  redis.call('SET', KEYS[2], ARGV[1])
  redis.call('ZADD', KEYS[3], ARGV[6], ARGV[1])
  return ARGV[1]
`;

const CLAIM_APPLICATION_MAIL = `
  if redis.call('HGET', KEYS[1], 'status') ~= ARGV[1] then return 0 end
  if redis.call('HGET', KEYS[1], ARGV[2]) == '1' then return 0 end
  if redis.call('SET', KEYS[2], ARGV[3], 'EX', 60, 'NX') then return 1 end
  return 0
`;

const FINISH_APPLICATION_MAIL = `
  if redis.call('GET', KEYS[2]) ~= ARGV[1] then return 0 end
  if ARGV[3] == '1' then redis.call('HSET', KEYS[1], ARGV[2], 1) end
  redis.call('DEL', KEYS[2])
  return 1
`;

const COUNT_ONCE = `
  if redis.call('EXISTS', KEYS[1]) == 0 then return 0 end
  if redis.call('SADD', KEYS[2], ARGV[1]) == 0 then return 0 end
  return redis.call('HINCRBY', KEYS[1], ARGV[2], 1)
`;

const ASSIGN_VISIT = `
  if redis.call('EXISTS', KEYS[1]) == 0 then return '' end
  local prior = redis.call('GET', KEYS[2])
  if prior then return prior end
  redis.call('SET', KEYS[2], ARGV[1], 'EX', 2592000)
  redis.call('HINCRBY', KEYS[1], 'visitors', 1)
  return ARGV[1]
`;

const COUNT_ATTEMPT = `
  local attempts = redis.call('INCR', KEYS[1])
  if attempts == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
  return attempts
`;

function storeError(code) {
  return Object.assign(new Error(code), { code });
}

function digest(value) {
  return createHash('sha256').update(value).digest('hex');
}

function partnerKey(id) {
  return PREFIX + 'partner:' + id;
}

function applicationKey(id) {
  return PREFIX + 'application:' + id;
}

function validId(id) {
  return typeof id === 'string' && PUBLIC_ID.test(id);
}

async function redis(body, pipeline = false) {
  let url = process.env.UPSTASH_REDIS_REST_URL;
  let token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    url = process.env.KV_REST_API_URL;
    token = process.env.KV_REST_API_TOKEN;
  }
  if (!url || !token) throw storeError('storage_unavailable');

  try {
    const response = await fetch(url.trim().replace(/\/+$/, '') + (pipeline ? '/pipeline' : ''), {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token.trim(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      redirect: 'error',
      signal: AbortSignal.timeout(4500),
    });
    if (!response.ok) throw storeError('storage_unavailable');
    const result = await response.json();
    const entries = pipeline ? result : [result];
    if (!Array.isArray(entries) || entries.length !== (pipeline ? body.length : 1)
      || entries.some(entry => !entry || entry.error || !Object.hasOwn(entry, 'result'))) {
      throw storeError('storage_unavailable');
    }
    return pipeline ? entries.map(entry => entry.result) : result.result;
  } catch {
    // Provider errors and request material must not reach the caller.
    throw storeError('storage_unavailable');
  }
}

function parsePartner(id, values, owner) {
  const [name, createdAt, visitors, leads, accessCode] = values;
  if (name === null) return null;
  const partner = { id, name, createdAt, visitors: Number(visitors), leads: Number(leads) };
  if (owner) partner.accessCode = accessCode;
  return partner;
}

function normalizedName(rawName) {
  const name = typeof rawName === 'string' ? rawName.trim().normalize('NFC') : '';
  if (!name || name.length > 120 || /[\u0000-\u001f\u007f]/.test(name)) throw storeError('invalid_request');
  return name;
}

async function createPartner(rawName, requestId) {
  const name = normalizedName(rawName);
  if (requestId !== undefined && (typeof requestId !== 'string' || !requestId.trim() || requestId.length > 256)) {
    throw storeError('invalid_request');
  }
  return savePartner(name, requestId === undefined ? undefined : PREFIX + 'create:' + digest(requestId), 'manual');
}

async function savePartner(name, decisionKey, operation) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const id = randomBytes(16).toString('hex');
    const accessCode = randomBytes(32).toString('base64url');
    const now = new Date();
    const keys = [partnerKey(id), PREFIX + 'access:' + digest(accessCode), PARTNERS];
    if (decisionKey) keys.push(decisionKey);
    const storedId = await redis(['EVAL', CREATE, keys.length, ...keys,
      id, name, now.toISOString(), accessCode, now.getTime(), operation]);
    if (storedId === null) return null;
    if (!storedId) continue; // A generated id or access code already exists.
    const row = await redis(['HMGET', partnerKey(storedId), ...OWNER_FIELDS]);
    const partner = parsePartner(storedId, row, true);
    if (!partner) throw storeError('storage_unavailable');
    if (partner.name !== name) throw storeError('idempotency_conflict');
    return partner;
  }
  throw storeError('storage_unavailable');
}

async function listRecords(indexKey, keyForId, fields, parse) {
  const ids = await redis(['ZREVRANGE', indexKey, 0, -1]);
  const records = [];
  for (let index = 0; index < ids.length; index += 100) {
    const batch = ids.slice(index, index + 100);
    const rows = await redis(batch.map(id => ['HMGET', keyForId(id), ...fields]), true);
    rows.forEach((row, i) => {
      const record = parse(batch[i], row);
      if (record) records.push(record);
    });
  }
  return records;
}

function listPartners() {
  return listRecords(PARTNERS, partnerKey, OWNER_FIELDS, (id, row) => parsePartner(id, row, true));
}

function parseApplication(id, values) {
  const [name, email, locale, status, createdAt, partnerId, alertSent, confirmationSent] = values;
  if (name === null) return null;
  return {
    id, name, email, locale, status, createdAt, ...(partnerId ? { partnerId } : {}),
    alertSent: Number(alertSent) === 1, confirmationSent: Number(confirmationSent) === 1,
  };
}

async function getApplication(id) {
  if (!validId(id)) return null;
  return parseApplication(id, await redis(['HMGET', applicationKey(id), ...APPLICATION_FIELDS]));
}

function listApplications() {
  return listRecords(APPLICATIONS, applicationKey, APPLICATION_FIELDS, parseApplication);
}

async function submitApplication(input) {
  const name = normalizedName(input?.name);
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  const locale = input.locale;
  if (!isValidEmail(email) || !APPLICATION_LOCALES.has(locale)) throw storeError('invalid_request');
  const emailKey = PREFIX + 'applicant:' + digest(email);
  for (let attempt = 0; attempt < 3; attempt++) {
    const id = randomBytes(16).toString('hex');
    const now = new Date();
    const storedId = await redis(['EVAL', SUBMIT_APPLICATION, 3, applicationKey(id), emailKey, APPLICATIONS,
      id, name, email, locale, now.toISOString(), now.getTime()]);
    if (storedId) {
      const application = await getApplication(storedId);
      if (!application) throw storeError('storage_unavailable');
      return application;
    }
  }
  throw storeError('storage_unavailable');
}

async function approveApplication(id) {
  const application = await getApplication(id);
  if (!application) return null;
  const partner = await savePartner(application.name, applicationKey(id), 'approval');
  if (!partner) return null;
  return { application: await getApplication(id), partner };
}

async function claimApplicationMail(id, kind) {
  if (!validId(id) || !['alert', 'confirmation'].includes(kind)) return null;
  const key = applicationKey(id);
  const token = randomBytes(16).toString('hex');
  const status = kind === 'alert' ? 'pending' : 'approved';
  const acquired = await redis(['EVAL', CLAIM_APPLICATION_MAIL, 2, key, key + ':mail:' + kind,
    status, kind + 'Sent', token]);
  return acquired === 1 ? token : null;
}

async function finishApplicationMail(id, kind, token, sent) {
  if (!validId(id) || !['alert', 'confirmation'].includes(kind) || !validId(token) || typeof sent !== 'boolean') return false;
  const key = applicationKey(id);
  const completed = await redis(['EVAL', FINISH_APPLICATION_MAIL, 2, key, key + ':mail:' + kind,
    token, kind + 'Sent', sent ? '1' : '0']);
  return completed === 1;
}

async function getPartnerStats(id) {
  if (!validId(id)) return null;
  const row = await redis(['HMGET', partnerKey(id), ...PUBLIC_FIELDS]);
  return parsePartner(id, row, false);
}

async function getPartner(code, expectedId) {
  if (typeof code !== 'string' || !ACCESS_CODE.test(code)) return null;
  const id = await redis(['GET', PREFIX + 'access:' + digest(code)]);
  if (!id || (expectedId !== undefined && expectedId !== id)) return null;
  return getPartnerStats(id);
}

async function recordLead(id, key) {
  if (!validId(id) || typeof key !== 'string' || !key.trim() || key.length > 256) return false;
  const partner = partnerKey(id);
  const count = await redis(['EVAL', COUNT_ONCE, 2, partner, partner + ':leads', digest(key), 'leads']);
  return count > 0;
}

async function assignVisit(id, visitorId) {
  if (!validId(id) || typeof visitorId !== 'string' || !visitorId || visitorId.length > 256) return null;
  const firstVisit = PREFIX + 'first:' + digest(visitorId);
  const assigned = await redis(['EVAL', ASSIGN_VISIT, 2, partnerKey(id), firstVisit, id]);
  return assigned || null;
}

async function consumeLoginAttempt(key, limit = 12, windowSeconds = 300) {
  if (typeof key !== 'string' || !key || key.length > 256
    || !Number.isSafeInteger(limit) || limit < 1 || !Number.isSafeInteger(windowSeconds) || windowSeconds < 1) {
    throw storeError('invalid_request');
  }
  const attempts = await redis(['EVAL', COUNT_ATTEMPT, 1, PREFIX + 'attempt:' + digest(key), windowSeconds]);
  return attempts <= limit;
}

module.exports = {
  createPartner, listPartners, getPartner, getPartnerStats, assignVisit, recordLead, consumeLoginAttempt,
  submitApplication, getApplication, listApplications, approveApplication, claimApplicationMail, finishApplicationMail,
};
