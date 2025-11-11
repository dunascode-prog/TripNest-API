// middlewares/xssEscapeSanitizer.js

/**
 * Simple HTML-escape for strings.
 * Escapes &, <, >, ", ', /.
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Recursively walk object and escape string fields in-place.
 * Uses WeakSet to avoid infinite loop on circular refs.
 */
function sanitizeInPlace(obj, visited = new WeakSet()) {
  if (!obj || typeof obj !== 'object') return;

  if (visited.has(obj)) return;
  visited.add(obj);

  for (const key of Object.keys(obj)) {
    try {
      const val = obj[key];

      if (typeof val === 'string') {
        obj[key] = escapeHtml(val);
      } else if (val && typeof val === 'object') {
        sanitizeInPlace(val, visited);
      }
      // leave numbers, booleans, functions etc. untouched
    } catch (err) {
      // defensive: log and continue
      // console.error('sanitizeInPlace error for key', key, err);
    }
  }
}

/**
 * Express middleware: escape strings to reduce XSS surface.
 * Mutates req.body, req.query, req.params in-place (no reassignment).
 */
function xssEscapeSanitizer(req, res, next) {
  try {
    if (req && req.body && typeof req.body === 'object') sanitizeInPlace(req.body);
    if (req && req.query && typeof req.query === 'object') sanitizeInPlace(req.query);
    if (req && req.params && typeof req.params === 'object') sanitizeInPlace(req.params);
  } catch (err) {
    // Do not break pipeline; log in dev
    if (process.env.NODE_ENV !== 'production') {
      console.error('xssEscapeSanitizer error:', err);
    }
  }
  next();
}

module.exports = xssEscapeSanitizer;
