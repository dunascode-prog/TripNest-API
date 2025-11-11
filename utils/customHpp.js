// customHpp.js
module.exports = (options = {}) => {
  const whitelist = options.whitelist || [];

  return (req, res, next) => {
    if (!req.query) return next();

    for (const key of Object.keys(req.query)) {
      const value = req.query[key];

      if (Array.isArray(value)) {
        if (key === 'sort') {
          req.query[key] = value[value.length - 1];
        } else if (!whitelist.includes(key)) {
          // Default behavior: take only the last one
          req.query[key] = value[value.length - 1];
        }
        // If in whitelist, leave as array
      }
    }

    next();
  };
};
