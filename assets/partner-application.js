(() => {
  'use strict';

  const form = document.getElementById('partner-application');
  const fields = form.querySelector('fieldset');
  const name = form.elements.namedItem('name');
  const email = form.elements.namedItem('email');
  const status = document.getElementById('application-status');
  const messages = status.dataset;

  function markInvalid(field, message) {
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', status.id);
    status.textContent = message;
    field.focus();
  }

  form.addEventListener('input', (event) => {
    event.target.removeAttribute('aria-invalid');
    event.target.removeAttribute('aria-describedby');
    status.textContent = '';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (fields.disabled || form.hidden) return;

    name.value = name.value.trim();
    email.value = email.value.trim();
    if (!name.value || name.value.length > name.maxLength || /[\u0000-\u001f\u007f]/.test(name.value)) {
      markInvalid(name, messages.invalidName);
      return;
    }
    if (!email.validity.valid || email.value.length > email.maxLength || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      markInvalid(email, messages.invalidEmail);
      return;
    }

    fields.disabled = true;
    status.textContent = messages.sending;
    form.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch('/api/referrals', {
        method: 'POST', mode: 'same-origin', credentials: 'omit', referrerPolicy: 'strict-origin', redirect: 'error',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'apply', name: name.value, email: email.value, locale: document.documentElement.lang }),
        signal: AbortSignal.timeout(15000),
      });
      if (response.status === 202 && (await response.json()).ok === true) {
        form.reset();
        form.hidden = true;
        status.textContent = messages.success;
        status.focus();
      } else if (response.status === 429) {
        status.textContent = messages.rate;
      } else if (response.status === 400) {
        status.textContent = messages.invalid;
      } else {
        status.textContent = messages.error;
      }
    } catch {
      status.textContent = messages.error;
    } finally {
      fields.disabled = form.hidden;
      form.removeAttribute('aria-busy');
    }
  });

  // The translated field errors replace the browser's own language when JavaScript is available.
  form.noValidate = true;
  fields.disabled = false;
})();
