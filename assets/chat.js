const translations = {
  'zh-CN': {
    launcher: 'AI 咨询',
    title: 'ZSJ AI 助手',
    close: '关闭聊天',
    welcome: '你好！你可以问我 ZSJ 做过哪些项目，也可以说说你的想法。我会为你推荐方案并给出预算范围。',
    message: '你的消息',
    placeholder: '输入你的问题',
    send: '发送',
    retry: '重试',
    you: '你',
    assistant: '助手',
    notice: 'OpenAI 会处理聊天内容。联系表单中的邮箱仅用于让 ZSJ 顾问与你联系。',
    contactEmail: '你的联系邮箱（选填）',
    requestContact: '请顾问联系我',
    emailSubmitted: '我希望 ZSJ 顾问联系我。',
    confirm_email: '如需顾问联系，请核对邮箱并点击“请顾问联系我”。',
    invalid_email: '请检查邮箱地址后重试。',
    contact_unavailable: '暂时无法提交联系请求，请稍后重试。',
    quote_expired: '此次联系请求已过期。请在聊天中重新说明你的项目。',
    sending: '正在生成回复…',
    rate_limited: '请求过于频繁，请稍等后重试。',
    invalid_request: '无法发送这条消息，请修改后重试。',
    temporarily_unavailable: '暂时无法回复，请稍后重试。',
    faq: '查看常见问题',
    project_incomplete: '请填写三个字段后再发送。'
  },
  fr: {
    launcher: 'Parler à l’IA',
    title: 'Assistant IA de ZSJ',
    close: 'Fermer le chat',
    welcome: 'Bonjour ! Vous pouvez découvrir les réalisations de ZSJ ou me décrire votre idée. Je vous proposerai un projet avec une fourchette de prix.',
    message: 'Votre message',
    placeholder: 'Saisissez votre question',
    send: 'Envoyer',
    retry: 'Réessayer',
    you: 'Vous',
    assistant: 'Assistant',
    notice: 'OpenAI traite les messages du chat. Le champ de contact transmet votre e-mail uniquement au consultant ZSJ pour qu’il vous recontacte.',
    contactEmail: 'Votre e-mail si vous souhaitez être recontacté',
    requestContact: 'Être recontacté',
    emailSubmitted: 'Je souhaite être recontacté par le consultant ZSJ.',
    confirm_email: 'Pour transmettre votre adresse au consultant, vérifiez-la puis cliquez sur « Être recontacté ».',
    invalid_email: 'Vérifiez votre adresse e-mail, puis réessayez.',
    contact_unavailable: 'Votre demande de contact n’a pas pu être transmise. Réessayez dans un instant.',
    quote_expired: 'Cette demande a expiré. Reparlez de votre projet dans le chat pour demander un contact.',
    sending: 'Réponse en cours…',
    rate_limited: 'Trop de demandes. Patientez un instant, puis réessayez.',
    invalid_request: 'Impossible d’envoyer ce message. Modifiez-le et réessayez.',
    temporarily_unavailable: 'Le chat est temporairement indisponible. Réessayez plus tard.',
    faq: 'Consulter la FAQ',
    project_incomplete: 'Renseignez les trois champs avant l’envoi.'
  },
  en: {
    launcher: 'AI chat',
    title: 'ZSJ AI assistant',
    close: 'Close chat',
    welcome: 'Hello! Ask about ZSJ’s past projects, or tell me what you’d like to build. I’ll suggest a project and give you an estimated price range.',
    message: 'Your message',
    placeholder: 'Type your question',
    send: 'Send',
    retry: 'Try again',
    you: 'You',
    assistant: 'Assistant',
    notice: 'OpenAI processes chat messages. The contact field shares your email only with the ZSJ consultant so they can get in touch.',
    contactEmail: 'Your email if you’d like us to contact you',
    requestContact: 'Contact me',
    emailSubmitted: 'I’d like the ZSJ consultant to contact me.',
    confirm_email: 'To share this address with the consultant, check it and choose “Contact me”.',
    invalid_email: 'Check your email address and try again.',
    contact_unavailable: 'We couldn’t forward your contact request. Please try again in a moment.',
    quote_expired: 'This request has expired. Describe your project in the chat again to request contact.',
    sending: 'Preparing a reply…',
    rate_limited: 'Too many requests. Wait a moment and try again.',
    invalid_request: 'This message could not be sent. Edit it and try again.',
    temporarily_unavailable: 'Chat is temporarily unavailable. Please try again later.',
    faq: 'Read the FAQ',
    project_incomplete: 'Complete all three fields before sending.'
  },
  it: {
    launcher: 'Chat con l’IA',
    title: 'Assistente IA di ZSJ',
    close: 'Chiudi la chat',
    welcome: 'Ciao! Puoi chiedermi dei progetti realizzati da ZSJ o raccontarmi la tua idea. Ti proporrò un progetto con una fascia di prezzo indicativa.',
    message: 'Il tuo messaggio',
    placeholder: 'Scrivi la tua domanda',
    send: 'Invia',
    retry: 'Riprova',
    you: 'Tu',
    assistant: 'Assistente',
    notice: 'OpenAI elabora i messaggi della chat. Il campo di contatto trasmette la tua email solo al consulente ZSJ perché possa ricontattarti.',
    contactEmail: 'La tua email se desideri essere ricontattato',
    requestContact: 'Chiedo di essere ricontattato',
    emailSubmitted: 'Vorrei essere ricontattato dal consulente ZSJ.',
    confirm_email: 'Per condividere il tuo indirizzo con il consulente, verificalo e seleziona «Chiedo di essere ricontattato».',
    invalid_email: 'Verifica il tuo indirizzo email e riprova.',
    contact_unavailable: 'Non è stato possibile inoltrare la richiesta di contatto. Riprova tra poco.',
    quote_expired: 'La richiesta è scaduta. Descrivi di nuovo il progetto nella chat per chiedere un contatto.',
    sending: 'Risposta in preparazione…',
    rate_limited: 'Troppe richieste. Attendi un momento e riprova.',
    invalid_request: 'Impossibile inviare il messaggio. Modificalo e riprova.',
    temporarily_unavailable: 'La chat è temporaneamente indisponibile. Riprova più tardi.',
    faq: 'Leggi le FAQ',
    project_incomplete: 'Compila i tre campi prima di inviare.'
  }
};

const launcher = document.getElementById('zsj-chat-launcher');
const panel = document.getElementById('zsj-chat-panel');
const title = document.getElementById('zsj-chat-title');
const close = document.getElementById('zsj-chat-close');
const log = document.getElementById('zsj-chat-log');
const welcome = document.getElementById('zsj-chat-welcome');
const form = document.getElementById('zsj-chat-form');
const status = document.getElementById('zsj-chat-status');
const faq = document.getElementById('zsj-chat-faq');
const input = document.getElementById('zsj-chat-message');
const send = document.getElementById('zsj-chat-send');
const projectForm = document.getElementById('zsj-project-form');
const projectSend = projectForm.querySelector('button[type="submit"]');
const projectStatus = document.getElementById('zsj-project-status');
const projectFields = ['business', 'goal', 'question'].map((name) => projectForm.elements.namedItem(name));
const emailForm = document.createElement('form');
emailForm.className = 'zsj-chat-email';
const emailLabel = document.createElement('label');
const emailField = document.createElement('input');
emailField.type = 'email';
emailField.id = 'zsj-quote-email';
emailField.name = 'email';
emailField.autocomplete = 'email';
emailField.required = true;
emailField.maxLength = 254;
emailField.setAttribute('aria-describedby', 'zsj-chat-notice');
emailLabel.htmlFor = emailField.id;
const emailSubmit = document.createElement('button');
emailSubmit.type = 'submit';
emailSubmit.className = 'zsj-chat-send';
emailForm.append(emailLabel, emailField, emailSubmit);

const recentMessages = [];
const failureStates = new Set(['invalid_request', 'rate_limited', 'temporarily_unavailable', 'invalid_email', 'contact_unavailable', 'quote_expired']);
const emailPattern = /[\p{L}\p{M}\p{N}.!#$%&'*+/=?^_`{|}~-]+@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)*/gu;
const maxContextMessages = 4;
const maxDisplayedMessages = 40;
let statusKey = '';
let quoteToken = null;
let projectStatusKey = '';
let projectMessageFailed = false;
let openingControl = launcher;

function locale() {
  const active = document.documentElement.lang;
  return Object.hasOwn(translations, active) ? active : 'zh-CN';
}

function updateStatus() {
  const labels = translations[locale()];
  const pending = statusKey === 'sending';
  const failed = failureStates.has(statusKey);
  status.textContent = statusKey ? labels[statusKey] : '';
  faq.hidden = !failed;
  input.readOnly = pending;
  send.disabled = pending || !input.value.trim();
  send.textContent = failed && !projectMessageFailed ? labels.retry : labels.send;
  emailField.readOnly = pending;
  emailSubmit.disabled = pending;
  projectSend.disabled = pending;
  projectStatus.textContent = labels[pending ? 'sending' : projectStatusKey] || '';
}

function applyLocale() {
  const labels = translations[locale()];
  for (const element of panel.querySelectorAll('[data-chat-label]')) {
    const key = element.dataset.chatLabel;
    element.textContent = key === 'you' || key === 'assistant' ? labels[key] + ': ' : labels[key];
  }
  launcher.querySelector('[data-chat-label]').textContent = labels.launcher;
  close.setAttribute('aria-label', labels.close);
  input.placeholder = labels.placeholder;
  emailLabel.textContent = labels.contactEmail;
  emailSubmit.textContent = labels.requestContact;
  updateStatus();
}

function openChat(control) {
  if (panel.hidden || control !== launcher) {
    openingControl = control;
  }
  panel.hidden = false;
  launcher.hidden = true;
  launcher.setAttribute('aria-expanded', 'true');
  updateStatus();
  title.focus({ preventScroll: true });
}

function closeChat(restoreFocus = true) {
  panel.hidden = true;
  launcher.hidden = false;
  launcher.setAttribute('aria-expanded', 'false');
  if (restoreFocus) {
    const control = openingControl.isConnected && !openingControl.disabled ? openingControl : launcher;
    control.focus({ preventScroll: true });
  }
}

function appendMessage(role, content) {
  const bubble = document.createElement('p');
  bubble.className = 'zsj-chat-message zsj-chat-message-' + role;

  const author = document.createElement('span');
  const authorKey = role === 'user' ? 'you' : 'assistant';
  author.className = 'zsj-chat-sr-only';
  author.dataset.chatLabel = authorKey;
  author.textContent = translations[locale()][authorKey] + ': ';

  bubble.append(author, document.createTextNode(content));
  log.append(bubble);
  log.scrollTop = log.scrollHeight;
  return bubble;
}

function boundedReply(reply) {
  return reply.slice(0, 1200).replace(/[\uD800-\uDBFF]$/, '').trimEnd();
}

function cleanDraft(draft) {
  // Keep line breaks and tabs while discarding other control characters from pasted text.
  return draft.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
}

function submitChat(event) {
  event.preventDefault();
  const draft = cleanDraft(input.value);
  if (emailForm.isConnected && draft.includes('@')) {
    // A bare address answers the invitation. An address in a sentence needs confirmation.
    const [email] = draft.match(emailPattern) || [];
    if (email === draft) {
      emailField.value = email;
      if (emailForm.reportValidity()) submitEmail(true);
      return;
    }
    if (email) {
      emailField.value = email;
      input.value = draft.replace(emailPattern, '[email]');
      statusKey = 'confirm_email';
      updateStatus();
      emailField.focus();
      return;
    }
  }
  sendMessage(draft);
}

function submitEmail(fromComposer) {
  const email = emailField.value.trim();
  return sendMessage(translations[locale()].emailSubmitted, { email, preserveDraft: !fromComposer });
}

function showContactForm(show) {
  if (quoteToken && show) {
    log.append(emailForm);
  } else {
    emailForm.remove();
    emailField.value = '';
  }
  log.scrollTop = log.scrollHeight;
}

function submitProject(event) {
  event.preventDefault();
  if (statusKey === 'sending' || !projectForm.reportValidity()) return;

  const values = projectFields.map((field) => cleanDraft(field.value));
  const invalidIndex = values.findIndex((value, index) => !value || value.length > projectFields[index].maxLength);
  if (invalidIndex !== -1) {
    projectStatusKey = 'project_incomplete';
    updateStatus();
    projectFields[invalidIndex].focus();
    return;
  }

  const content = projectFields.map((field, index) => {
    const label = field.labels[0].textContent.trim();
    const separator = locale() === 'zh-CN' ? '：' : ': ';
    return label + separator + values[index];
  }).join('\n');
  openChat(projectSend);
  sendMessage(content, { fromProject: true });
}

async function sendMessage(content, { fromProject = false, email, preserveDraft = fromProject } = {}) {
  if (statusKey === 'sending') return;
  projectMessageFailed = false;
  if (!content || content.length > input.maxLength) {
    statusKey = 'invalid_request';
    if (fromProject) projectStatusKey = statusKey;
    updateStatus();
    return;
  }

  const message = { role: 'user', content: content.replace(emailPattern, '[email]') };
  const request = email ? { locale: locale(), email } : { locale: locale(), messages: [...recentMessages, message] };
  if (quoteToken) request.quoteToken = quoteToken;
  const originalDraft = input.value;
  const restoreInputFocus = !fromProject && document.activeElement === send;
  statusKey = 'sending';
  if (fromProject) projectStatusKey = '';
  welcome.hidden = true;
  if (!preserveDraft) input.value = '';
  const pendingBubble = appendMessage('user', message.content);
  updateStatus();
  if (restoreInputFocus) input.focus({ preventScroll: true });

  try {
    if (email && await window.zsjReferral?.contactConsent()) request.referralConsent = true;
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(20000),
      redirect: 'error'
    });
    const result = await response.json().catch(() => null);
    const reply = typeof result?.reply === 'string' ? result.reply.trim().replace(emailPattern, '[email]') : '';
    if (response.ok && reply) {
      quoteToken = typeof result.quoteToken === 'string' ? result.quoteToken : null;
      recentMessages.push(message, { role: 'assistant', content: boundedReply(reply) });
      recentMessages.splice(0, Math.max(0, recentMessages.length - maxContextMessages));

      const moveFocusToChat = !panel.hidden && emailForm.contains(document.activeElement);
      appendMessage('assistant', reply);
      showContactForm(result.requestEmail === true);
      if (moveFocusToChat && !emailForm.isConnected) input.focus({ preventScroll: true });
      while (log.childElementCount > maxDisplayedMessages + 1) {
        welcome.nextElementSibling.remove();
      }
      statusKey = '';
    } else if (response.status === 429) {
      statusKey = 'rate_limited';
    } else if (email && result?.error === 'quote_expired') {
      quoteToken = null;
      showContactForm(false);
      if (!panel.hidden) input.focus({ preventScroll: true });
      statusKey = 'quote_expired';
    } else if (email) {
      statusKey = result?.error === 'invalid_email' ? 'invalid_email' : 'contact_unavailable';
    } else if (result?.error === 'invalid_request') {
      statusKey = 'invalid_request';
    } else {
      statusKey = 'temporarily_unavailable';
    }
  } catch {
    statusKey = email ? 'contact_unavailable' : 'temporarily_unavailable';
  }

  if (failureStates.has(statusKey)) {
    pendingBubble.remove();
    welcome.hidden = recentMessages.length > 0;
    if (fromProject) {
      projectStatusKey = statusKey;
      projectMessageFailed = true;
    } else if (!preserveDraft && statusKey !== 'quote_expired') {
      input.value = originalDraft;
    }
  }
  updateStatus();
}

for (const control of document.querySelectorAll('[data-zsj-chat-open]')) {
  control.addEventListener('click', (event) => {
    event.preventDefault();
    openChat(control);
  });
}
close.addEventListener('click', () => closeChat());
panel.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !event.isComposing) closeChat();
});
faq.addEventListener('click', () => {
  closeChat(false);
  document.getElementById('faq').focus({ preventScroll: true });
});
form.addEventListener('submit', submitChat);
emailForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (emailForm.reportValidity()) submitEmail(false);
});
projectForm.addEventListener('submit', submitProject);
projectForm.addEventListener('input', () => {
  projectStatusKey = '';
  updateStatus();
});
input.addEventListener('input', () => {
  statusKey = '';
  updateStatus();
});

applyLocale();
launcher.closest('.zsj-chat').hidden = false;
