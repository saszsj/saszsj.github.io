const SITE_ORIGINS = ['https://www.zsj.fr', 'https://zsj.fr', 'https://saszsj-github-io.vercel.app'];

function isAllowedOrigin(request) {
  const origin = request.headers.origin;
  const host = request.headers.host;
  if (typeof origin !== 'string' || typeof host !== 'string') {
    return false;
  }

  const knownOrigins = [
    ...SITE_ORIGINS,
    ...[process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]
      .filter(Boolean)
      .map((deployment) => 'https://' + deployment),
  ];

  // Local development accepts only loopback origins with the same host and port.
  if (process.env.VERCEL !== '1' || process.env.VERCEL_ENV === 'development') {
    if (/^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host)) {
      knownOrigins.push('http://' + host);
    }
  }

  return knownOrigins.includes(origin) && new URL(origin).host === host;
}

module.exports = { isAllowedOrigin };
