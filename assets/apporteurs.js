(() => {
  'use strict';
  const admin = document.body.dataset.portal === 'admin';
  const byId = (id) => document.getElementById(id);
  const login = byId('login');
  const credential = byId('credential');
  const dashboard = byId('dashboard');
  const status = byId('status');
  const logout = byId('logout');
  const create = byId('create');
  const list = byId('list');
  const applicationList = byId('applications-list');
  const integer = new Intl.NumberFormat('fr-FR');
  const date = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  let partners = [];
  let applications = [];
  let creationAttempt;
  let busy = false;
  let rowNumber = 0;

  const errors = {
    invalid_request: 'Vérifiez les informations saisies et réessayez.',
    unauthorized: 'Veuillez vous connecter pour accéder à cet espace.',
    invalid_credentials: admin ? 'Le mot de passe est incorrect.' : 'Vérifiez votre code privé et le lien de votre espace.',
    rate_limited: 'Trop de tentatives. Patientez un moment avant de réessayer.',
    unknown_partner: 'Cet accès apporteur est introuvable. Vérifiez le lien qui vous a été transmis.',
    unavailable: 'Le service est temporairement indisponible. Réessayez dans un instant.'
  };

  function announce(message = '', error = false) {
    status.textContent = message;
    status.dataset.error = String(error);
  }

  async function api(action, fields = {}) {
    const response = await fetch('/api/referrals', {
      method: 'POST', credentials: 'same-origin', cache: 'no-store', redirect: 'error',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...fields }),
      signal: AbortSignal.timeout(18000)
    });
    const body = await response.json().catch(() => null);
    if (!response.ok || !body) throw new Error(body?.error || 'unavailable');
    return body;
  }

  function locked(value) {
    busy = value;
    document.querySelectorAll('button').forEach((button) => { button.disabled = value; });
    login.setAttribute('aria-busy', String(value));
    dashboard.setAttribute('aria-busy', String(value));
  }

  function showLogin() {
    dashboard.hidden = true;
    logout.hidden = true;
    credential.value = '';
    if (admin) {
      partners = [];
      applications = [];
      creationAttempt = undefined;
      list.replaceChildren();
      applicationList.replaceChildren();
      byId('count').textContent = '';
      create.reset();
    } else {
      byId('partner-name').textContent = '';
      byId('metrics').replaceChildren();
      byId('share').replaceChildren();
    }
    login.hidden = false;
  }

  function showDashboard() {
    login.hidden = true;
    credential.value = '';
    dashboard.hidden = false;
    logout.hidden = false;
  }

  async function run(operation, { initial = false } = {}) {
    if (busy) return;
    locked(true);
    announce(initial ? 'Vérification de la session…' : 'Chargement…');
    try {
      await operation();
    } catch (error) {
      if (initial || error.message === 'unauthorized') showLogin();
      announce(initial && error.message === 'unauthorized' ? '' : errors[error.message] || errors.unavailable, true);
    } finally {
      locked(false);
    }
  }

  function element(tag, text, className) {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (className) el.className = className;
    return el;
  }

  function metrics(partner) {
    const values = element('dl', undefined, 'metrics');
    for (const [label, count] of [['Visiteurs uniques', partner.visitors], ['Prospects uniques', partner.leads]]) {
      const pair = element('div');
      pair.append(element('dt', label), element('dd', integer.format(count)));
      values.append(pair);
    }
    return values;
  }

  function shareValue(labelText, value) {
    const row = element('div', undefined, 'share-row');
    const label = element('label', labelText);
    const field = element('input');
    field.type = 'text';
    field.id = 'share-' + ++rowNumber;
    field.value = value;
    field.readOnly = true;
    field.spellcheck = false;
    label.htmlFor = field.id;
    const copy = element('button', 'Copier', 'secondary');
    copy.type = 'button';
    copy.setAttribute('aria-label', 'Copier · ' + labelText);
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(value);
        copy.textContent = 'Copié';
        announce('Copie effectuée.');
      } catch {
        field.focus();
        field.select();
        announce('Texte sélectionné. Utilisez la commande Copier de votre appareil.');
      }
    });
    row.append(label, field, copy);
    return row;
  }

  function shareLink(id) {
    const url = new URL('/fr/', location.origin);
    url.searchParams.set('ref', id);
    return url.href;
  }

  function adminCard(partner) {
    const card = element('article', undefined, 'portal-card partner-card');
    card.id = 'apporteur-' + partner.id;
    card.tabIndex = -1;
    const header = element('div', undefined, 'section-heading');
    const identity = element('div');
    identity.append(element('h3', partner.name));
    const when = new Date(partner.createdAt);
    if (!Number.isNaN(when.valueOf())) identity.append(element('p', 'Créé le ' + date.format(when), 'created'));
    header.append(identity, metrics(partner));
    const privateUrl = new URL('/apporteur/', location.origin);
    privateUrl.hash = encodeURIComponent(partner.id);
    card.append(
      header,
      shareValue('Lien à partager aux prospects', shareLink(partner.id)),
      shareValue('Lien du tableau de bord privé', privateUrl.href),
      shareValue('Code d’accès privé de l’apporteur', partner.accessCode)
    );
    return card;
  }

  function renderList(updated) {
    partners = updated;
    byId('count').textContent = '(' + integer.format(partners.length) + ')';
    list.replaceChildren(...partners.map(adminCard));
    if (!partners.length) list.append(element('p', 'Aucun apporteur pour le moment.', 'empty'));
    showDashboard();
  }

  function applicationCard(application) {
    const card = element('article', undefined, 'portal-card');
    card.id = 'candidature-' + application.id;
    card.tabIndex = -1;
    const heading = element('div', undefined, 'section-heading');
    const approved = application.status === 'approved';
    heading.append(element('h3', application.name), element('span', approved ? 'Approuvée' : 'En attente de validation', 'application-state'));
    card.append(heading, element('p', application.email, 'application-email'));
    const when = new Date(application.createdAt);
    if (!Number.isNaN(when.valueOf())) card.append(element('p', 'Reçue le ' + date.format(when), 'created'));

    const addMailStatus = (kind, label, sent) => {
      const row = element('div', undefined, 'application-mail');
      const retryAvailable = !sent && (kind === 'confirmation' || !approved);
      const delivery = sent ? 'envoyée' : retryAvailable ? 'en attente' : 'non envoyée';
      row.append(element('span', label + ' — ' + delivery, retryAvailable ? 'pending' : ''));
      if (retryAvailable) {
        const retry = element('button', 'Réessayer l’envoi', 'secondary');
        retry.type = 'button';
        retry.setAttribute('aria-label', 'Réessayer l’envoi · ' + label + ' · ' + application.name);
        retry.addEventListener('click', () => updateApplication(application.id, kind));
        row.append(retry);
      }
      card.append(row);
    };
    addMailStatus('alert', 'Alerte à ZSJ', application.alertSent);
    if (approved) {
      addMailStatus('confirmation', 'Confirmation au candidat', application.confirmationSent);
      if (application.partnerId) {
        const access = element('a', 'Voir l’accès de cet apporteur', 'application-action application-link');
        access.href = '#apporteur-' + encodeURIComponent(application.partnerId);
        card.append(access);
      }
    } else {
      const approve = element('button', 'Approuver et envoyer les accès', 'primary application-action');
      approve.type = 'button';
      approve.addEventListener('click', () => updateApplication(application.id));
      card.append(approve);
    }
    return card;
  }

  function renderApplications(updated = []) {
    applications = [...updated].sort((a, b) =>
      Number(a.status === 'approved') - Number(b.status === 'approved') || new Date(b.createdAt) - new Date(a.createdAt));
    applicationList.replaceChildren(...applications.map(applicationCard));
    if (!applications.length) applicationList.append(element('p', 'Aucune candidature pour le moment.', 'empty'));
  }

  async function loadAdminLists() {
    const result = await api('admin_list');
    renderList(result.partners);
    renderApplications(result.applications);
  }

  function updateApplication(id, kind) {
    return run(async () => {
      const { application, mailStatus } = kind
        ? await api('admin_retry_mail', { id, kind })
        : await api('admin_approve', { id });
      renderApplications(applications.map((current) => current.id === id ? application : current));
      const mail = kind === 'alert' ? 'Alerte à ZSJ' : 'Confirmation au candidat';
      const outcome = mail + (mailStatus === 'sent' ? ' envoyée.' : ' en attente d’envoi.');
      let message = kind ? outcome : 'Candidature approuvée. ' + outcome;
      if (!kind) {
        try {
          await loadAdminLists();
        } catch (error) {
          if (error.message === 'unauthorized') throw error;
          message += ' Actualisez pour retrouver l’accès apporteur.';
        }
      }
      byId('candidature-' + id)?.focus();
      announce(message, mailStatus !== 'sent');
    });
  }

  function renderPartner(partner) {
    byId('partner-name').textContent = partner.name;
    byId('metrics').replaceChildren(metrics(partner));
    byId('share').replaceChildren(shareValue('Mon lien à partager aux prospects', shareLink(partner.id)));
    showDashboard();
  }

  function partnerId() {
    const id = location.hash.slice(1);
    return id ? { id } : {};
  }

  async function reconcileReceipt() {
    const match = /^#demande=([a-fA-F0-9]{32}\.[A-Za-z0-9_-]{43}\.[A-Za-z0-9_-]{43})$/.exec(location.hash);
    if (!match) {
      announce('Le lien de cette demande est incomplet.', true);
      return;
    }
    try {
      const { partnerId, added } = await api('admin_reconcile', { receipt: match[1] });
      if (added) await loadAdminLists();
      history.replaceState(history.state, '', location.pathname + location.search);
      byId('apporteur-' + partnerId)?.focus();
      announce(added ? 'Prospect comptabilisé pour cet apporteur.' : 'Ce prospect était déjà comptabilisé pour cet apporteur.');
    } catch (error) {
      if (error.message === 'unauthorized') throw error;
      announce('Attribution à vérifier. Cliquez sur « Actualiser » pour réessayer.', true);
    }
  }

  async function refresh(message = '', focusHeading = false) {
    if (admin) {
      await loadAdminLists();
      if (focusHeading) byId('applications-heading').focus();
      if (location.hash.startsWith('#candidature=')) {
        const card = byId('candidature-' + location.hash.slice('#candidature='.length));
        if (card) card.focus();
        else { announce('Cette candidature est introuvable.', true); return; }
      }
      if (location.hash.startsWith('#demande=')) {
        await reconcileReceipt();
        return;
      }
    } else {
      const { partner } = await api('partner_stats', partnerId());
      renderPartner(partner);
    }
    announce(message);
  }

  login.addEventListener('submit', (event) => {
    event.preventDefault();
    run(async () => {
      if (admin) {
        await api('admin_login', { password: credential.value });
        credential.value = '';
        await refresh('', true);
      } else {
        const { partner } = await api('partner_login', { code: credential.value.trim(), ...partnerId() });
        renderPartner(partner);
        announce();
        byId('partner-name').focus();
      }
    });
  });

  if (admin) {
    window.addEventListener('hashchange', () => {
      if (!dashboard.hidden && location.hash.startsWith('#candidature=')) run(refresh);
    });
    create.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = byId('name');
      const name = input.value.trim();
      if (!name) { announce('Indiquez le nom de l’apporteur.', true); input.focus(); return; }
      run(async () => {
        if (creationAttempt?.name !== name) creationAttempt = { name, requestId: crypto.randomUUID() };
        const { partner } = await api('admin_create', creationAttempt);
        renderList([partner, ...partners.filter((existing) => existing.id !== partner.id)]);
        creationAttempt = undefined;
        create.reset();
        announce('Accès créé pour ' + partner.name + '.');
        byId('list-heading').focus();
      });
    });
  } else {
    window.addEventListener('hashchange', () => location.reload());
  }

  byId('refresh').addEventListener('click', () => run(() => refresh('Statistiques actualisées.')));
  logout.addEventListener('click', () => run(async () => {
    await api(admin ? 'admin_logout' : 'partner_logout');
    showLogin();
    announce('Vous êtes déconnecté.');
    credential.focus();
  }));
  window.addEventListener('pagehide', showLogin);
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) run(refresh, { initial: true });
  });
  run(refresh, { initial: true });
})();
