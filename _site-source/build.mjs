import { mkdir, readFile, writeFile } from 'node:fs/promises';

const origin = 'https://www.zsj.fr';
const root = new URL('../', import.meta.url);
const template = await readFile(new URL('home.template', import.meta.url), 'utf8');
const copy = JSON.parse(await readFile(new URL('locales.json', import.meta.url), 'utf8'));
const portfolio = JSON.parse(await readFile(new URL('portfolio.json', import.meta.url), 'utf8'));
const partnerTemplate = await readFile(new URL('partner-program.template', import.meta.url), 'utf8');
const partnerCopy = JSON.parse(await readFile(new URL('partner-program.json', import.meta.url), 'utf8'));
const check = process.argv.includes('--check');
const analyticsMeasurementId = 'G-Z30LFBCXDH';

const locales = [
  { id: 'zh-CN', hreflang: 'zh-Hans', path: '/', partnerPath: '/partners/', label: '中文', openGraphLocale: 'zh_CN' },
  { id: 'fr', hreflang: 'fr', path: '/fr/', partnerPath: '/fr/devenir-partenaire/', label: 'Français', openGraphLocale: 'fr_FR' },
  { id: 'en', hreflang: 'en', path: '/en/', partnerPath: '/en/become-a-partner/', label: 'English', openGraphLocale: 'en_GB' },
  { id: 'it', hreflang: 'it', path: '/it/', partnerPath: '/it/diventa-partner/', label: 'Italiano', openGraphLocale: 'it_IT' },
];

const alternates = [...locales, { hreflang: 'x-default', path: '/' }];
const organizationId = `${origin}/#organization`;
const websiteId = `${origin}/#website`;
const escape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;');

function portfolioCards(cards, sourceLabels) {
  return cards.map(({ title, detail, description, source }) => {
    const reference = sourceLabels && source ? portfolio.sources[source] : null;
    const label = reference ? sourceLabels[reference.label] : '';
    return [
      '          <li>',
      `            <h3>${escape(title)}</h3>`,
      `            <p class="portfolio-detail">${escape(detail)}</p>`,
      `            <p class="portfolio-description">${escape(description)}</p>`,
      ...(reference ? [
        `            <a class="portfolio-source" href="${escape(reference.url)}" aria-label="${escape(`${label} · ${title}`)}">${escape(label)}</a>`,
      ] : []),
      '          </li>',
    ].join('\n');
  }).join('\n');
}

function metadata(locale, content) {
  const canonical = origin + locale.path;
  const serviceId = `${canonical}#services`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': organizationId, name: 'ZSJ', url: `${origin}/` },
      { '@type': 'WebSite', '@id': websiteId, name: 'ZSJ', url: `${origin}/`, publisher: { '@id': organizationId } },
      {
        '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical,
        name: content.title, description: content.description, inLanguage: locale.hreflang,
        isPartOf: { '@id': websiteId }, mainEntity: { '@id': serviceId },
      },
      {
        '@type': 'Service', '@id': serviceId, url: `${canonical}#services`, name: content.serviceHeading,
        description: content.intro, provider: { '@id': organizationId },
      },
    ],
  };

  return [
    `<title>${escape(content.title)}</title>`,
    `<meta name="description" content="${escape(content.description)}" />`,
    ...(locale.path === '/' ? ['<meta name="google-site-verification" content="nXZRqEmrMSZBX22-4TK-kWSMkRQrwVlXJu2nmQXrR9g" />'] : []),
    `<link rel="canonical" href="${canonical}" />`,
    ...alternates.map(({ hreflang, path }) => `<link rel="alternate" hreflang="${hreflang}" href="${origin}${path}" />`),
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="ZSJ" />',
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:locale" content="${locale.openGraphLocale}" />`,
    `<meta property="og:title" content="${escape(content.title)}" />`,
    `<meta property="og:description" content="${escape(content.description)}" />`,
    `<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>`,
  ].map((tag) => `  ${tag}`).join('\n');
}

function page(locale) {
  const content = copy[locale.id];
  const { experiences, realizations } = portfolio[locale.id];
  const assetPrefix = locale.path === '/' ? './' : '../';
  const languageLinks = locales.map(({ id, hreflang, path, label }) => {
    const active = id === locale.id;
    return `          <a href="${assetPrefix}${path.slice(1)}" lang="${hreflang}" hreflang="${hreflang}"${active ? ' aria-current="page"' : ''}>${label}</a>`;
  }).join('\n');

  const fields = {
    ...Object.fromEntries(Object.entries(content).map(([key, value]) => [key, escape(value)])),
    locale: locale.id,
    metadata: metadata(locale, content),
    languageLinks,
    assetPrefix,
    partnerProgramHref: assetPrefix + locale.partnerPath.slice(1),
    partnerProgramTitle: escape(partnerCopy[locale.id].title),
    experiencesTitle: escape(experiences.title),
    experiencesIntro: escape(experiences.intro),
    experienceCards: portfolioCards(experiences.cards, experiences.sourceLabels),
    maltLabel: escape(experiences.maltLabel),
    realizationsTitle: escape(realizations.title),
    realizationsIntro: escape(realizations.intro),
    realizationCards: portfolioCards(realizations.cards),
    analyticsScript: analyticsMeasurementId
      ? `  <script defer src="${assetPrefix}assets/analytics.js" data-measurement-id="${analyticsMeasurementId}"></script>`
      : '',
    analyticsPrivacy: analyticsMeasurementId ? [
      '<details class="analytics-privacy">',
      `  <summary>${escape(content.analyticsPrivacyHeading)}</summary>`,
      `  <p>${escape(content.analyticsPrivacy)}</p>`,
      `  <a href="https://policies.google.com/technologies/partner-sites">${escape(content.analyticsPolicy)}</a>`,
      '</details>',
      '<button id="analytics-preferences" type="button" hidden aria-controls="analytics-consent" aria-expanded="false"',
      `  class="analytics-preferences">${escape(content.analyticsPreferences)}</button>`,
    ].map((line) => `      ${line}`).join('\n') : '',
  };

  return template
    .replace('<!doctype html>\n', '<!doctype html>\n<!-- Generated by node _site-source/build.mjs from files in _site-source. -->\n')
    .replace(/^ *<span data-lang-inline="([\w-]+)">[\s\S]*?<\/span>\n/gm, (element, id) => (
      id === locale.id ? element.replace(` data-lang-inline="${id}"`, '') : ''
    ))
    .replace(/{{(\w+)}}/g, (_, key) => {
      if (!Object.hasOwn(fields, key)) throw new Error(`Unknown template field: ${key}`);
      return fields[key];
    });
}

function partnerPage(locale) {
  const content = partnerCopy[locale.id];
  const assetPrefix = '../'.repeat(locale.partnerPath.split('/').filter(Boolean).length);
  const canonical = origin + locale.partnerPath;
  const fields = {
    ...Object.fromEntries(Object.entries(content).filter(([key]) => key !== 'steps').map(([key, value]) => [key, escape(value)])),
    locale: locale.id,
    assetPrefix,
    homeHref: assetPrefix + locale.path.slice(1),
    portalHref: assetPrefix + 'apporteur/',
    stepItems: content.steps.map(step => `          <li><h3>${escape(step.title)}</h3><p>${escape(step.text)}</p></li>`).join('\n'),
    languageLinks: locales.map(({ id, hreflang, label, partnerPath }) =>
      `        <a href="${assetPrefix}${partnerPath.slice(1)}" lang="${hreflang}" hreflang="${hreflang}"${id === locale.id ? ' aria-current="page"' : ''}>${label}</a>`).join('\n'),
    metadata: [
      `<title>${escape(content.title)} | ZSJ</title>`,
      `<meta name="description" content="${escape(content.description)}" />`,
      `<link rel="canonical" href="${canonical}" />`,
      ...locales.map(({ hreflang, partnerPath }) => `<link rel="alternate" hreflang="${hreflang}" href="${origin}${partnerPath}" />`),
      `<link rel="alternate" hreflang="x-default" href="${origin}${locales[0].partnerPath}" />`,
    ].join('\n  '),
  };
  return partnerTemplate.replace(/{{(\w+)}}/g, (_, key) => {
    if (!Object.hasOwn(fields, key)) throw new Error(`Unknown partner template field: ${key}`);
    return fields[key];
  });
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locales.flatMap(locale => [locale.path, locale.partnerPath]).map(path => `  <url><loc>${origin}${path}</loc></url>`).join('\n')}
</urlset>
`;
const robots = `User-agent: *\nDisallow:\n\nSitemap: ${origin}/sitemap.xml\n`;

const files = [
  ...locales.map((locale) => [`${locale.path.slice(1)}index.html`, page(locale)]),
  ...locales.map((locale) => [`${locale.partnerPath.slice(1)}index.html`, partnerPage(locale)]),
  ['sitemap.xml', sitemap],
  ['robots.txt', robots],
];

for (const [path, content] of files) {
  const file = new URL(path, root);
  if (check) {
    const existing = await readFile(file, 'utf8');
    if (existing !== content) throw new Error(`Regenerate ${path} with node _site-source/build.mjs`);
  } else {
    await mkdir(new URL('./', file), { recursive: true });
    await writeFile(file, content);
  }
}
