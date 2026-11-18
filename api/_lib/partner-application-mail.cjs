const { OWNER_EMAIL, isValidEmail, sendSiteMail } = require('./mail-transport.cjs');
const { PARTNER_ID } = require('./referral-session.cjs');

const ORIGIN = 'https://www.zsj.fr';
const COPY = {
  fr: {
    path: '/fr/', subject: 'Votre candidature au programme d’apporteurs ZSJ est acceptée',
    greeting: name => 'Bonjour ' + name + ',',
    intro: 'Votre candidature a été acceptée. Vous pouvez désormais recommander ZSJ à vos contacts.',
    publicCode: 'Votre code apporteur public', share: 'Lien à partager avec vos contacts',
    dashboard: 'Votre espace partenaire privé', access: 'Code d’accès privé à saisir sur cette page',
    closing: 'Gardez ce code d’accès pour vous. Votre espace affiche les visites et les demandes de contact attribuées à vos recommandations.',
  },
  en: {
    path: '/en/', subject: 'Your ZSJ referral partner application has been approved',
    greeting: name => 'Hello ' + name + ',',
    intro: 'Your application has been approved. You can now refer your contacts to ZSJ.',
    publicCode: 'Your public referral code', share: 'Link to share with your contacts',
    dashboard: 'Your private partner dashboard', access: 'Private access code to enter on that page',
    closing: 'Keep this access code private. Your dashboard shows the visits and contact requests attributed to your referrals.',
  },
  it: {
    path: '/it/', subject: 'La tua candidatura come partner ZSJ è stata approvata',
    greeting: name => 'Ciao ' + name + ',',
    intro: 'La tua candidatura è stata approvata. Ora puoi presentare ZSJ ai tuoi contatti.',
    publicCode: 'Il tuo codice partner pubblico', share: 'Link da condividere con i tuoi contatti',
    dashboard: 'La tua area partner riservata', access: 'Codice di accesso privato da inserire nella pagina',
    closing: 'Conserva questo codice di accesso per te. Nella tua area puoi consultare le visite e le richieste di contatto attribuite alle tue segnalazioni.',
  },
  'zh-CN': {
    path: '/', subject: '你的 ZSJ 推荐合作伙伴申请已获批准', greeting: name => name + '，你好！',
    intro: '你的申请已获批准。现在可以向有项目需求的朋友或客户推荐 ZSJ。',
    publicCode: '你的公开推荐码', share: '可分享给客户的推荐链接',
    dashboard: '你的合作伙伴专属后台', access: '登录后台时输入的私人访问码',
    closing: '请妥善保管私人访问码。你可以在后台查看通过你的推荐带来的访问人数和联系请求数。',
  },
};

function validateApplication(application) {
  if (!application || !PARTNER_ID.test(application.id) || !isValidEmail(application.email) ||
      typeof application.name !== 'string' || !application.name.trim() ||
      /[\x00-\x1f\x7f]/u.test(application.name) || !Object.hasOwn(COPY, application.locale)) {
    throw new Error('invalid_application_mail');
  }
}

async function sendApplicationAlert(application) {
  validateApplication(application);
  await sendSiteMail('application-alert', application.id, {
    to: [OWNER_EMAIL], reply_to: application.email,
    subject: 'Nouvelle candidature au programme d’apporteurs ZSJ',
    text: [
      'Une personne souhaite devenir apporteur pour ZSJ.',
      'Nom\n' + application.name, 'E-mail\n' + application.email,
      'Examiner la candidature dans votre espace administrateur\n' + ORIGIN + '/admin/apporteurs/#candidature=' + application.id,
    ].join('\n\n'),
  });
}

async function sendApplicationConfirmation(application, partner) {
  validateApplication(application);
  if (application.status !== 'approved' || !partner || !PARTNER_ID.test(partner.id) ||
      application.partnerId !== partner.id || !/^[\w-]{43}$/.test(partner.accessCode || '')) {
    throw new Error('invalid_application_approval');
  }
  const copy = COPY[application.locale];
  await sendSiteMail('application-confirmation', application.id, {
    to: [application.email], subject: copy.subject,
    text: [
      copy.greeting(application.name), copy.intro,
      copy.publicCode + '\n' + partner.id,
      copy.share + '\n' + ORIGIN + copy.path + '?ref=' + partner.id,
      copy.dashboard + '\n' + ORIGIN + '/apporteur/#' + partner.id,
      copy.access + '\n' + partner.accessCode,
      copy.closing, 'ZSJ',
    ].join('\n\n'),
  });
}

module.exports = { sendApplicationAlert, sendApplicationConfirmation };
