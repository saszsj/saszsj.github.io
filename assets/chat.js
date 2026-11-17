const translations = {
  'zh-CN': {
    launcher: 'AI 咨询',
    title: 'ZSJ AI 助手',
    close: '关闭聊天',
    welcome: '你好！你可以问我 ZSJ 的服务，或介绍你的业务和希望优先解决的问题。',
    message: '你的消息',
    placeholder: '输入你的问题',
    send: '发送',
    retry: '重试',
    you: '你',
    assistant: '助手',
    notice: '消息会由 OpenAI 处理以生成回复。请勿发送敏感信息。',
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
    welcome: 'Bonjour ! Posez une question sur les services de ZSJ ou présentez votre activité et le problème à résoudre en priorité.',
    message: 'Votre message',
    placeholder: 'Saisissez votre question',
    send: 'Envoyer',
    retry: 'Réessayer',
    you: 'Vous',
    assistant: 'Assistant',
    notice: 'OpenAI traite vos messages pour générer les réponses. Évitez les informations sensibles.',
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
    welcome: 'Hello! Ask about ZSJ’s services or tell me about your business and the problem you want to tackle first.',
    message: 'Your message',
    placeholder: 'Type your question',
    send: 'Send',
    retry: 'Try again',
    you: 'You',
    assistant: 'Assistant',
    notice: 'OpenAI processes your messages to generate replies. Avoid sending sensitive information.',
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
    welcome: 'Ciao! Chiedimi dei servizi di ZSJ oppure descrivi la tua attività e il problema da affrontare per primo.',
    message: 'Il tuo messaggio',
    placeholder: 'Scrivi la tua domanda',
    send: 'Invia',
    retry: 'Riprova',
    you: 'Tu',
    assistant: 'Assistente',
    notice: 'OpenAI elabora i tuoi messaggi per generare le risposte. Evita di inviare informazioni sensibili.',
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
const wechatContact = document.querySelector('footer .zsj-wechat-contact');

const recentMessages = [];
const failureStates = new Set(['invalid_request', 'rate_limited', 'temporarily_unavailable']);
const maxContextMessages = 4;
const maxDisplayedMessages = 40;
let statusKey = '';
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

function appendMessage(role, content, wechatInvite = false) {
  const bubble = document.createElement('p');
  bubble.className = 'zsj-chat-message zsj-chat-message-' + role;

  const author = document.createElement('span');
  const authorKey = role === 'user' ? 'you' : 'assistant';
  author.className = 'zsj-chat-sr-only';
  author.dataset.chatLabel = authorKey;
  author.textContent = translations[locale()][authorKey] + ': ';

  bubble.append(author, document.createTextNode(content));
  if (wechatInvite && wechatContact) {
    bubble.append(wechatContact.cloneNode(true));
  }
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
  sendMessage(cleanDraft(input.value));
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

async function sendMessage(content, { fromProject = false } = {}) {
  if (statusKey === 'sending') return;
  projectMessageFailed = false;
  if (!content || content.length > input.maxLength) {
    statusKey = 'invalid_request';
    if (fromProject) projectStatusKey = statusKey;
    updateStatus();
    return;
  }

  const message = { role: 'user', content };
  const request = { locale: locale(), messages: [...recentMessages, message] };
  const originalDraft = input.value;
  const restoreInputFocus = !fromProject && document.activeElement === send;
  statusKey = 'sending';
  if (fromProject) projectStatusKey = '';
  welcome.hidden = true;
  if (!fromProject) input.value = '';
  const pendingBubble = appendMessage('user', content);
  updateStatus();
  if (restoreInputFocus) input.focus({ preventScroll: true });

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(20000),
      redirect: 'error'
    });
    const result = await response.json().catch(() => null);
    const reply = typeof result?.reply === 'string' ? result.reply.trim() : '';
    if (response.ok && reply) {
      recentMessages.push(message, { role: 'assistant', content: boundedReply(reply) });
      recentMessages.splice(0, Math.max(0, recentMessages.length - maxContextMessages));

      appendMessage('assistant', reply, result.wechatInvite === true);
      while (log.childElementCount > maxDisplayedMessages + 1) {
        welcome.nextElementSibling.remove();
      }
      statusKey = '';
    } else if (result?.error === 'credit_exhausted') {
      statusKey = 'temporarily_unavailable';
    } else if (response.status === 429) {
      statusKey = 'rate_limited';
    } else if (result?.error === 'invalid_request') {
      statusKey = 'invalid_request';
    } else {
      statusKey = 'temporarily_unavailable';
    }
  } catch {
    statusKey = 'temporarily_unavailable';
  }

  if (failureStates.has(statusKey)) {
    pendingBubble.remove();
    welcome.hidden = recentMessages.length > 0;
    if (fromProject) {
      projectStatusKey = statusKey;
      projectMessageFailed = true;
    } else {
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
