const portfolio = require('./portfolio.json');

function describeCard({ title, detail, description }) {
  return [title, detail, description].join(' — ');
}

function getPortfolioInstructions(locale) {
  const { realizations, experiences } = portfolio[locale];
  return [
    'Use these public website entries for questions about Shengjie Zhan’s work. For a list of all portfolio projects, include every project below. For a specific brief, choose the closest example and explain the relevant feature.',
    'Keep pilot and prototype labels. Only attribute a client, feature, or outcome when the entry says so. Historical prices, client identities, deployment status and usage figures are not supplied. Any estimate is for the visitor’s proposed scope.',
    realizations.title,
    ...realizations.cards.map(describeCard),
    'The following entries describe professional experience. Use them for questions about background and organizational work.',
    experiences.title,
    ...experiences.cards.map(describeCard),
  ].join('\n');
}

module.exports = { getPortfolioInstructions };
