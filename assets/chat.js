const templates = {
  growth: {
    'zh-CN': '我想提升获客与成交：\n1）我的行业/主营业务：\n2）主要获客渠道：\n3）当前最大问题：回复慢/线索流失/成交慢（选）\n4）团队人数与时间：\n5）希望1个月达成：',
    fr: 'Je veux améliorer l’acquisition et la conversion :\n1) Secteur / activité :\n2) Canaux d’acquisition :\n3) Problème principal : réponses lentes / pertes de prospects / conversions faibles\n4) Taille d’équipe :\n5) Objectif en 30 jours :',
    en: 'I want to improve acquisition and conversion:\n1) Industry / main business:\n2) Main acquisition channels:\n3) Biggest issue: slow replies / lead loss / low conversion\n4) Team size:\n5) 30‑day goal:',
    it: 'Voglio migliorare acquisizione e conversione:\n1) Settore / attività:\n2) Canali principali:\n3) Problema principale: risposte lente / perdita contatti / bassa conversione\n4) Dimensione team:\n5) Obiettivo in 30 giorni:'
  },
  efficiency: {
    'zh-CN': '我想提升管理效率：\n1）团队规模与分布：\n2）目前最耗时的环节：沟通/交付/协作/新人上手（选）\n3）希望优先解决：流程/交接/质量/复盘（选）\n4）1个月目标：',
    fr: 'Je veux gagner en efficacité :\n1) Taille et répartition de l’équipe :\n2) Étape la plus chronophage : communication / livraison / collaboration / intégration\n3) Priorité : processus / passation / qualité / revue\n4) Objectif en 30 jours :',
    en: 'I want to improve efficiency:\n1) Team size and distribution:\n2) Most time‑consuming step: communication / delivery / collaboration / onboarding\n3) Priority: process / handover / quality / review\n4) 30‑day goal:',
    it: 'Voglio aumentare l’efficienza:\n1) Dimensione e distribuzione del team:\n2) Fase più dispendiosa: comunicazione / consegna / collaborazione / onboarding\n3) Priorità: processo / passaggio consegne / qualità / revisione\n4) Obiettivo in 30 giorni:'
  },
  service: {
    'zh-CN': '我想提升客户服务：\n1）服务对象：客户/会员/合作伙伴（选）\n2）常见问题类型：售前/售后/退换/开票（选）\n3）需要支持语言：中/法/英/意（选）\n4）每天咨询量：\n5）希望1个月改善：',
    fr: 'Je veux améliorer le service client :\n1) Public : clients / membres / partenaires\n2) Questions fréquentes : avant‑vente / après‑vente / retours / factures\n3) Langues nécessaires : FR / EN / ZH / IT\n4) Volume quotidien :\n5) Amélioration attendue en 30 jours :',
    en: 'I want to upgrade customer service:\n1) Audience: customers / members / partners\n2) Common issues: pre‑sales / after‑sales / returns / invoices\n3) Languages needed: EN / FR / ZH / IT\n4) Daily volume:\n5) 30‑day improvement goal:',
    it: 'Voglio migliorare il servizio clienti:\n1) Pubblico: clienti / membri / partner\n2) Problemi comuni: pre‑vendita / post‑vendita / resi / fatture\n3) Lingue necessarie: IT / EN / FR / ZH\n4) Volume giornaliero:\n5) Obiettivo in 30 giorni:'
  },
  knowledge: {
    'zh-CN': '我想把资料整理清楚：\n1）资料类型：报价/合同/邮件/培训/FAQ（选）\n2）目前存放：本地/网盘/云盘（选）\n3）使用人群：管理/销售/客服（选）\n4）希望1个月的效果：',
    fr: 'Je veux clarifier mes infos :\n1) Types : devis / contrats / emails / formation / FAQ\n2) Stockage actuel : local / drive / cloud\n3) Utilisateurs : direction / ventes / support\n4) Résultat attendu en 30 jours :',
    en: 'I want to organize our information:\n1) Types: quotes / contracts / emails / training / FAQ\n2) Current storage: local / drive / cloud\n3) Users: management / sales / support\n4) 30‑day outcome:',
    it: 'Voglio organizzare le informazioni:\n1) Tipi: preventivi / contratti / email / formazione / FAQ\n2) Archiviazione: locale / drive / cloud\n3) Utenti: management / vendite / supporto\n4) Risultato in 30 giorni:'
  },
  operations: {
    'zh-CN': '我想让跟进与交付更稳定：\n1）主要服务/项目类型：\n2）当前最大卡点：跟进慢/交付乱/回访缺失（选）\n3）关键节点：报价/合同/交付/回访（选）\n4）1个月目标：',
    fr: 'Je veux stabiliser le suivi et la livraison :\n1) Type de service/projet :\n2) Principal blocage : suivi lent / livraison chaotique / pas de retour\n3) Étapes clés : devis / contrat / livraison / feedback\n4) Objectif en 30 jours :',
    en: 'I want stable follow‑ups and delivery:\n1) Main service/project type:\n2) Biggest issue: slow follow‑up / messy delivery / no feedback\n3) Key steps: quote / contract / delivery / feedback\n4) 30‑day goal:',
    it: 'Voglio stabilizzare follow‑up e consegna:\n1) Tipo di servizio/progetto:\n2) Problema principale: follow‑up lento / consegna disordinata / feedback assente\n3) Passaggi chiave: preventivo / contratto / consegna / feedback\n4) Obiettivo in 30 giorni:'
  },
  multilang: {
    'zh-CN': '我想统一多语言对外表达：\n1）目标客户/国家：\n2）所需语言：中/法/英/意（选）\n3）材料类型：简介/提案/邮件/FAQ（选）\n4）1个月希望达成：',
    fr: 'Je veux unifier la communication multilingue :\n1) Pays/clients cibles :\n2) Langues : FR / EN / ZH / IT\n3) Types : présentation / proposition / email / FAQ\n4) Objectif en 30 jours :',
    en: 'I want consistent multilingual communication:\n1) Target countries/customers:\n2) Languages: EN / FR / ZH / IT\n3) Materials: brief / proposal / email / FAQ\n4) 30‑day goal:',
    it: 'Voglio comunicazione multilingue coerente:\n1) Paesi/clienti target:\n2) Lingue: IT / EN / FR / ZH\n3) Materiali: presentazione / proposta / email / FAQ\n4) Obiettivo in 30 giorni:'
  },
  diagnosis: {
    'zh-CN': '我想了解90分钟转型诊断：\n1）行业/主要业务：\n2）当前最大问题：\n3）团队人数：\n4）希望1个月达成：',
    fr: 'Je voudrais en savoir plus sur le diagnostic de 90 minutes :\n1) Secteur / activité :\n2) Problème principal :\n3) Taille d’équipe :\n4) Objectif en 30 jours :',
    en: 'I’d like to learn more about the 90‑minute diagnostic session:\n1) Industry / business:\n2) Biggest issue:\n3) Team size:\n4) 30‑day goal:',
    it: 'Vorrei informazioni sulla diagnosi di 90 minuti:\n1) Settore / attività:\n2) Problema principale:\n3) Dimensione team:\n4) Obiettivo in 30 giorni:'
  },
  implementation: {
    'zh-CN': '我想做30天落地：\n1）行业/主要业务：\n2）主要获客/服务入口：\n3）希望先解决：获客/服务/交付/协作（选）\n4）团队人数与时间：\n5）1个月目标：',
    fr: 'Je veux un déploiement en 30 jours :\n1) Secteur / activité :\n2) Principales entrées clients :\n3) Priorité : acquisition / service / livraison / collaboration\n4) Taille d’équipe :\n5) Objectif en 30 jours :',
    en: 'I want a 30‑day implementation:\n1) Industry / business:\n2) Main customer entry points:\n3) Priority: acquisition / service / delivery / collaboration\n4) Team size:\n5) 30‑day goal:',
    it: 'Voglio un’implementazione in 30 giorni:\n1) Settore / attività:\n2) Principali canali clienti:\n3) Priorità: acquisizione / servizio / consegna / collaborazione\n4) Dimensione team:\n5) Obiettivo in 30 giorni:'
  },
  advisor: {
    'zh-CN': '我想咨询年度陪跑：\n1）目标：增长/复购/规模化（选）\n2）现有客户量与转化：\n3）团队配置：\n4）希望我每月参与的内容：复盘/流程/内容（选）',
    fr: 'Je veux un accompagnement annuel :\n1) Objectif : croissance / réachat / échelle\n2) Volume client actuel :\n3) Équipe :\n4) Contenu mensuel souhaité : revue / process / contenu',
    en: 'I want annual support:\n1) Goal: growth / repeat / scale\n2) Current customer volume:\n3) Team setup:\n4) Monthly focus: review / process / content',
    it: 'Voglio un affiancamento annuale:\n1) Obiettivo: crescita / riacquisto / scala\n2) Volume clienti attuale:\n3) Team:\n4) Focus mensile: revisione / processo / contenuti'
  }
};

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
    draft_kept: '已保留你正在编辑的消息。',
    rate_limited: '请求过于频繁，请稍等后重试。',
    invalid_request: '无法发送这条消息，请修改后重试。',
    temporarily_unavailable: '暂时无法回复，请稍后重试。',
    faq: '查看常见问题',
    copied: '已复制。',
    copy_failed: '无法自动复制，请选中模板文字后复制。'
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
    draft_kept: 'Votre brouillon a été conservé.',
    rate_limited: 'Trop de demandes. Patientez un instant, puis réessayez.',
    invalid_request: 'Impossible d’envoyer ce message. Modifiez-le et réessayez.',
    temporarily_unavailable: 'Le chat est temporairement indisponible. Réessayez plus tard.',
    faq: 'Consulter la FAQ',
    copied: 'Copié.',
    copy_failed: 'La copie automatique est indisponible. Sélectionnez le texte du modèle pour le copier.'
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
    draft_kept: 'Your draft was kept.',
    rate_limited: 'Too many requests. Wait a moment and try again.',
    invalid_request: 'This message could not be sent. Edit it and try again.',
    temporarily_unavailable: 'Chat is temporarily unavailable. Please try again later.',
    faq: 'Read the FAQ',
    copied: 'Copied.',
    copy_failed: 'Automatic copying is unavailable. Select the template text to copy it.'
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
    draft_kept: 'La tua bozza è stata conservata.',
    rate_limited: 'Troppe richieste. Attendi un momento e riprova.',
    invalid_request: 'Impossibile inviare il messaggio. Modificalo e riprova.',
    temporarily_unavailable: 'La chat è temporaneamente indisponibile. Riprova più tardi.',
    faq: 'Leggi le FAQ',
    copied: 'Copiato.',
    copy_failed: 'La copia automatica non è disponibile. Seleziona il testo del modello per copiarlo.'
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
const copy = document.getElementById('zsj-copy-template');
const copyStatus = document.getElementById('zsj-copy-status');
const intakeTemplate = document.getElementById('zsj-intake-template');
const wechatContact = document.querySelector('footer .zsj-wechat-contact');

const recentMessages = [];
const failureStates = new Set(['invalid_request', 'rate_limited', 'temporarily_unavailable']);
const maxContextMessages = 4;
const maxDisplayedMessages = 40;
let statusKey = '';
let openingControl = launcher;
let prefilledDraft = '';

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
  send.textContent = failed ? labels.retry : labels.send;
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
  copyStatus.textContent = '';
  updateStatus();
}

function openChat(control) {
  const template = templates[control.dataset.zsjChatOpen]?.[locale()];
  if (template && statusKey !== 'sending') {
    if (!input.value.trim() || input.value === prefilledDraft) {
      input.value = template;
      prefilledDraft = template;
      statusKey = '';
    } else if (!failureStates.has(statusKey)) {
      statusKey = 'draft_kept';
    }
  }

  if (panel.hidden || control !== launcher) {
    openingControl = control;
  }
  panel.hidden = false;
  launcher.hidden = true;
  launcher.setAttribute('aria-expanded', 'true');
  updateStatus();
  if (template) {
    input.focus({ preventScroll: true });
    input.setSelectionRange(input.value.length, input.value.length);
  } else {
    title.focus({ preventScroll: true });
  }
}

function closeChat(restoreFocus = true) {
  panel.hidden = true;
  launcher.hidden = false;
  launcher.setAttribute('aria-expanded', 'false');
  if (restoreFocus) {
    const control = openingControl.isConnected ? openingControl : launcher;
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

async function submitChat(event) {
  event.preventDefault();
  const originalDraft = input.value;
  const content = cleanDraft(originalDraft);
  if (statusKey === 'sending') return;
  if (!content || content.length > input.maxLength) {
    statusKey = 'invalid_request';
    updateStatus();
    return;
  }

  const message = { role: 'user', content };
  const request = { locale: locale(), messages: [...recentMessages, message] };
  const restoreInputFocus = document.activeElement === send;
  statusKey = 'sending';
  prefilledDraft = '';
  welcome.hidden = true;
  input.value = '';
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
    input.value = originalDraft;
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
  document.querySelector('#faq h2').focus({ preventScroll: true });
});
form.addEventListener('submit', submitChat);
input.addEventListener('input', () => {
  statusKey = '';
  prefilledDraft = '';
  updateStatus();
});
copy.addEventListener('click', async () => {
  const visibleTemplate = intakeTemplate.querySelector('[data-lang-inline="' + locale() + '"]');
  let copyStatusKey = 'copied';
  try {
    await navigator.clipboard.writeText(visibleTemplate.innerText.trim());
  } catch {
    copyStatusKey = 'copy_failed';
  }
  copyStatus.textContent = translations[locale()][copyStatusKey];
});

applyLocale();
launcher.closest('.zsj-chat').hidden = false;
