const LOCALHOST_ORIGIN_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(?::\d+)?$/i;

const splitOrigins = (value) =>
  (value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const getAllowedOrigins = () =>
  new Set(
    [
      ...splitOrigins(process.env.CLIENT_URL),
      ...splitOrigins(process.env.CLIENT_URLS),
      ...splitOrigins(process.env.ALLOWED_ORIGINS),
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
    ].filter(Boolean)
  );

const isAllowedOrigin = (origin) => !origin || LOCALHOST_ORIGIN_PATTERN.test(origin) || getAllowedOrigins().has(origin);

module.exports = { getAllowedOrigins, isAllowedOrigin };