const { OWNER_EMAIL, isValidEmail: isValidQuoteEmail, sendSiteMail } = require('./mail-transport.cjs');

async function sendQuoteRequest({ email, project, range, requestId, referralId, leadReceipt }) {
  if (!isValidQuoteEmail(email) ||
      typeof project !== 'string' || !project.trim() || typeof range !== 'string' || !range.trim() ||
      typeof requestId !== 'string' || !requestId) throw new Error('invalid_quote_mail');

  const message = {
    to: [OWNER_EMAIL],
    reply_to: email,
    subject: 'Demande de contact pour un devis sur zsj.fr',
    text: [
      'Un visiteur souhaite échanger avec un consultant ZSJ au sujet du projet suivant.',
      project,
      'Fourchette présentée dans le chat\n' + range,
      'E-mail du prospect\n' + email,
      ...(referralId && leadReceipt ? [
        'Identifiant public du partenaire\n' + referralId,
        'Retrouver cet apporteur et vérifier le comptage du prospect\n' +
          'https://www.zsj.fr/admin/apporteurs/#demande=' + encodeURIComponent(leadReceipt),
      ] : []),
      'Répondez à ce message pour le contacter.',
    ].join('\n\n'),
  };
  await sendSiteMail('quote', requestId, message);
}

module.exports = { isValidQuoteEmail, sendQuoteRequest };
