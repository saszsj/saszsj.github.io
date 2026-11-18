const { createHmac, randomUUID, timingSafeEqual } = require('node:crypto');

const ranges = {
  website_chat: [2000, 5000],
  custom: [8000, 20000],
};

const labels = {
  fr: {
    website_chat: 'Site avec chatbot', custom: 'Projet sur mesure',
    estimate: 'Budget indicatif', invitation: 'Ce projet vous intéresse à ce budget ? Laissez votre e-mail pour être recontacté par un consultant ZSJ.',
    sent: 'Votre demande a été transmise à ZSJ. Un consultant vous recontactera par e-mail au sujet de ce projet.',
    clarify: 'Quel projet souhaitez-vous réaliser ?',
  },
  en: {
    website_chat: 'Website with a chatbot', custom: 'Custom project',
    estimate: 'Estimated budget', invitation: 'Interested in this project at this budget? Leave your email address so a ZSJ consultant can contact you.',
    sent: 'Your request has been sent to ZSJ. A consultant will contact you by email about this project.',
    clarify: 'What would you like to build?',
  },
  it: {
    website_chat: 'Sito con chatbot', custom: 'Progetto su misura',
    estimate: 'Budget indicativo', invitation: 'Ti interessa questo progetto con questo budget? Lascia la tua e-mail per essere ricontattato da un consulente ZSJ.',
    sent: 'La tua richiesta è stata trasmessa a ZSJ. Un consulente ti contatterà via e-mail per parlare del progetto.',
    clarify: 'Quale progetto vorresti realizzare?',
  },
  'zh-CN': {
    website_chat: '带聊天机器人的网站', custom: '定制项目',
    estimate: '预估预算', invitation: '如果你对这个方案和预算感兴趣，可以留下电子邮箱，ZSJ 顾问会通过邮件与你联系。',
    sent: '你的需求已发送给 ZSJ，顾问会通过电子邮件与你联系，讨论这个项目。',
    clarify: '你希望做一个什么样的项目？',
  },
};

function formatRange(type, locale) {
  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  return ranges[type].map(value => formatter.format(value)).join(' – ');
}

// A quote travels with this chat tab, even if the next request hits another instance.
// Only the server can issue its project, price category and mail idempotency key.
function signature(payload, key) {
  return createHmac('sha256', key).update('zsj-callback-v1:' + payload).digest();
}

function issueQuote(type, project, locale, key) {
  const quote = { type, project, locale, id: randomUUID(), expires: Date.now() + 23 * 3600_000 };
  const payload = Buffer.from(JSON.stringify(quote)).toString('base64url');
  return payload + '.' + signature(payload, key).toString('base64url');
}

function verifyQuote(token, locale, key) {
  if (!token || typeof token !== 'string' || token.length > 4096 || !key) return null;
  const [payload, mac, extra] = token.split('.');
  if (!payload || !mac || extra !== undefined) return null;
  const expected = signature(payload, key).toString('base64url');
  if (mac.length !== expected.length || !/^[\w-]+$/.test(mac) ||
      !timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  try {
    const quote = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (quote.locale === locale && quote.expires > Date.now() && Object.hasOwn(ranges, quote.type)) return quote;
  } catch {
    // Invalid state cannot authorize an email.
  }
  return null;
}

module.exports = { ranges, labels, formatRange, issueQuote, verifyQuote };
