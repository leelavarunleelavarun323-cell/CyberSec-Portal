/* ═══════════════════════════════════════════════════════════════
   middleware/validate.js — Input Validation Helpers
   Lightweight validation without external libraries.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Sanitize a string: trim whitespace and collapse consecutive spaces.
 * Returns null if input is not a non-empty string.
 */
function sanitizeString(value) {
  if (typeof value !== 'string') return null;
  const cleaned = value.trim().replace(/\s+/g, ' ');
  return cleaned.length > 0 ? cleaned : null;
}

/**
 * Middleware factory: validates that required body fields exist
 * and are non-empty strings. Returns 400 with details on failure.
 *
 * @param {string[]} requiredFields - Field names to validate
 * @param {Object}   [options]
 * @param {number}   [options.maxLength=10000] - Max chars per field
 */
function validateBody(requiredFields, options = {}) {
  const { maxLength = 10000 } = options;

  return (req, res, next) => {
    const errors = [];

    for (const field of requiredFields) {
      const raw = req.body[field];
      const clean = sanitizeString(raw);

      if (clean === null) {
        errors.push(`"${field}" is required and must be a non-empty string.`);
      } else if (clean.length > maxLength) {
        errors.push(`"${field}" exceeds maximum length of ${maxLength} characters.`);
      } else {
        // Replace raw value with sanitized version
        req.body[field] = clean;
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors,
      });
    }

    next();
  };
}

/**
 * Validate that a terminal command string is safe and within bounds.
 * Returns the cleaned command or null.
 */
function validateCommand(value) {
  const clean = sanitizeString(value);
  if (!clean) return null;
  // Cap command length to prevent abuse
  if (clean.length > 200) return null;
  return clean;
}

module.exports = { sanitizeString, validateBody, validateCommand };
