(() => {
  'use strict';

  const measurementId = document.currentScript?.dataset.measurementId;
  const panel = document.getElementById('analytics-consent');
  const preferences = document.getElementById('analytics-preferences');
  const accept = document.getElementById('analytics-accept');
  const refuse = document.getElementById('analytics-refuse');

  if (!measurementId || !/^G-[A-Z0-9]+$/.test(measurementId) || !panel || !preferences || !accept || !refuse) return;

  const productionOrigin = 'https://www.zsj.fr';
  const isProduction = location.origin === productionOrigin;
  const preferenceKey = 'zsj.analyticsConsent.v1';
  const cookiePrefix = 'zsj_analytics';
  const maxAgeSeconds = 180 * 24 * 60 * 60;
  const disabledFlag = `ga-disable-${measurementId}`;
  const denied = {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  };

  let choice;
  let tagRequested = false;
  let tagReady = false;
  let viewSent = false;

  function readChoice() {
    try {
      const stored = JSON.parse(localStorage.getItem(preferenceKey));
      if (stored?.expiresAt > Date.now() && (stored.choice === 'accepted' || stored.choice === 'refused')) {
        return stored.choice;
      }
    } catch {
      // A blocked or invalid preference never enables tracking on a new page.
    }
    return null;
  }

  function storeChoice(next) {
    try {
      localStorage.setItem(preferenceKey, JSON.stringify({ choice: next, expiresAt: Date.now() + maxAgeSeconds * 1000 }));
    } catch {
      // If a replacement cannot be stored, try to remove any previous approval.
      try { localStorage.removeItem(preferenceKey); } catch { /* Storage is unavailable. */ }
    }
  }

  function setPanel(open, manageFocus = false) {
    panel.hidden = !open;
    preferences.setAttribute('aria-expanded', String(open));
    if (manageFocus) (open ? panel : preferences).focus();
  }

  function cleanReferrer() {
    try {
      const referrer = new URL(document.referrer);
      if (referrer.protocol === 'https:' || referrer.protocol === 'http:') return referrer.origin;
    } catch {
      // A direct visit may have no referrer.
    }
    return '';
  }

  function gtag() {
    window.dataLayer.push(arguments);
  }

  function sendView() {
    if (!tagReady || viewSent || choice !== 'accepted') return;
    viewSent = true;
    gtag('event', 'page_view', { send_to: measurementId });
  }

  function enableAnalytics() {
    window[disabledFlag] = false;
    if (tagRequested) {
      sendView();
      return;
    }

    tagRequested = true;
    window.dataLayer = window.dataLayer || [];
    gtag('consent', 'default', denied);
    gtag('consent', 'update', { ...denied, analytics_storage: 'granted' });
    gtag('js', new Date());
    gtag('config', measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      send_page_view: false,
      cookie_domain: 'none',
      cookie_path: '/',
      cookie_prefix: cookiePrefix,
      cookie_expires: maxAgeSeconds,
      cookie_update: false,
      cookie_flags: 'SameSite=Lax;Secure',
      page_location: `${productionOrigin}${location.pathname}`,
      page_referrer: cleanReferrer(),
    });

    const tag = document.createElement('script');
    tag.async = true;
    tag.referrerPolicy = 'no-referrer';
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    tag.addEventListener('load', () => {
      tagReady = true;
      sendView();
    }, { once: true });
    document.head.append(tag);
  }

  function disableAnalytics() {
    window[disabledFlag] = true;
    try {
      for (const cookie of document.cookie.split(';')) {
        const name = cookie.trim().split('=', 1)[0];
        if (name.startsWith(`${cookiePrefix}_`) && /^[a-z0-9_]+$/i.test(name)) {
          document.cookie = `${name}=; Max-Age=0; Path=/; Secure; SameSite=Lax`;
        }
      }
    } catch { /* Cookie storage is unavailable. */ }
  }

  function applyChoice(next, manageFocus = false) {
    choice = next;
    setPanel(!choice, manageFocus);
    if (!isProduction) return;
    if (choice === 'accepted') enableAnalytics();
    else disableAnalytics();
  }

  function choose(next) {
    storeChoice(next);
    applyChoice(next, true);
  }

  preferences.hidden = false;
  preferences.addEventListener('click', () => setPanel(panel.hidden, true));
  accept.addEventListener('click', () => choose('accepted'));
  refuse.addEventListener('click', () => choose('refused'));
  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setPanel(false, true);
  });
  window.addEventListener('storage', (event) => {
    if (event.key === preferenceKey || event.key === null) applyChoice(readChoice());
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) applyChoice(readChoice());
  });

  applyChoice(readChoice());
})();
