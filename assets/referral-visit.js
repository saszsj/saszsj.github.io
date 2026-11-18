(() => {
  'use strict';

  const referralIdPattern = /^[a-f0-9]{32}$/;
  const uuidPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
  const fromLink = new URL(location.href).searchParams.get('ref');
  const referralId = referralIdPattern.test(fromLink || '') ? fromLink : null;
  const cookieName = 'zsj_ref_visit';
  const lifetime = 30 * 24 * 60 * 60 * 1000;
  let consent;
  let work = Promise.resolve();
  let visitController;

  function readVisitor() {
    try {
      const item = document.cookie.split('; ').find((part) => part.startsWith(cookieName + '='));
      if (!item) return null;
      const [visitorId, expires, firstReferral] = item.slice(cookieName.length + 1).split('.');
      const expiresAt = Number(expires);
      if (uuidPattern.test(visitorId) && expiresAt > Date.now() && expiresAt <= Date.now() + lifetime &&
          (firstReferral === '' || referralIdPattern.test(firstReferral || ''))) {
        return { visitorId, expiresAt, firstReferral };
      }
    } catch { /* Cookie storage may be unavailable. */ }
    return null;
  }

  function writeVisitor(visitor) {
    const value = visitor ? [visitor.visitorId, visitor.expiresAt, visitor.firstReferral].join('.') : '';
    const expires = new Date(visitor?.expiresAt || 0).toUTCString();
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    try { document.cookie = cookieName + '=' + value + '; Path=/; Expires=' + expires + '; SameSite=Lax' + secure; }
    catch { /* The chat still works when storage is blocked. */ }
  }

  function updateLanguageLinks(forward) {
    if (!referralId) return;
    for (const link of document.querySelectorAll('.locale-switch a[hreflang]')) {
      const url = new URL(link.href);
      if (url.origin !== location.origin) continue;
      if (forward) url.searchParams.set('ref', referralId);
      else url.searchParams.delete('ref');
      link.href = url.href;
    }
  }

  function post(data, signal = AbortSignal.timeout(8000)) {
    return fetch('/api/referrals', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      credentials: 'same-origin', referrerPolicy: 'strict-origin', redirect: 'error',
      keepalive: true, signal,
    });
  }

  async function recordVisit() {
    if (consent !== 'accepted' || !referralId) return;
    let visitor = readVisitor();
    if (!visitor) {
      if (typeof crypto.randomUUID !== 'function') return;
      writeVisitor({ visitorId: crypto.randomUUID(), expiresAt: Date.now() + lifetime, firstReferral: '' });
      visitor = readVisitor();
    }
    if (!visitor) return;
    if (!visitor.firstReferral) {
      visitController = new AbortController();
      const timer = setTimeout(() => visitController.abort(), 8000);
      let credited;
      try {
        const response = await post({ action: 'visit', id: referralId, visitorId: visitor.visitorId }, visitController.signal);
        if (!response.ok) return;
        credited = await response.json();
      } finally {
        clearTimeout(timer);
        visitController = undefined;
      }
      if (consent !== 'accepted' || !credited?.ok || !referralIdPattern.test(credited.id || '')) return;
      writeVisitor({ ...visitor, firstReferral: credited.id });
    }
    updateLanguageLinks(false);
  }

  function setConsent(next) {
    if (next === consent) return;
    const previous = consent;
    consent = next;
    updateLanguageLinks(next !== 'refused');
    if (next === 'accepted' && referralId) {
      // Simultaneous first visits in two tabs must agree on one visitor and one referrer.
      work = work.then(() => navigator.locks
        ? navigator.locks.request('zsj-referral-visit', recordVisit) : recordVisit()).catch(() => {});
    } else if (next !== 'accepted' && (previous === 'accepted' || readVisitor())) {
      visitController?.abort();
      writeVisitor(null);
      // An immediate keepalive request also clears the HttpOnly cookie if the visitor leaves.
      work = Promise.allSettled([work, post({ action: 'forget' })]);
    }
  }

  async function contactConsent() {
    if (consent !== 'accepted') return false;
    let timer;
    try {
      await Promise.race([work, new Promise((resolve) => { timer = setTimeout(resolve, 2500); })]);
    } finally { clearTimeout(timer); }
    return consent === 'accepted';
  }

  window.zsjReferral = { setConsent, contactConsent };
})();
