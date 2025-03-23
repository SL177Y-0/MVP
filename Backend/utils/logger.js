/**
 * Simple logger utility
 * In a production environment, this should be replaced with a more robust solution like Winston
 */

// Log levels
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

// Get current environment
const NODE_ENV = process.env.NODE_ENV || 'development';

// Set default log level based on environment
let currentLogLevel = NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

// Sensitive fields that should be redacted in logs
const SENSITIVE_FIELDS = ['password', 'token', 'authToken', 'auth_token', 'key', 'secret', 'Authorization'];

/**
 * Sanitize an object by redacting sensitive fields
 * @param {Object} obj - Object to sanitize
 * @returns {Object} - Sanitized object
 */
function sanitize(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitize(item));
  }
  
  // Handle objects
  const sanitized = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      // Redact sensitive fields
      sanitized[key] = '***REDACTED***';
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitize(value);
    } else {
      // Keep non-sensitive values as is
      sanitized[key] = value;
    }
  });
  
  return sanitized;
}

/**
 * Format a log message
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 * @returns {string} - Formatted log message
 */
function formatLog(level, message, data) {
  const timestamp = new Date().toISOString();
  let logString = `[${timestamp}] [${level}] ${message}`;
  
  if (data) {
    try {
      const sanitizedData = sanitize(data);
      logString += ` ${JSON.stringify(sanitizedData)}`;
    } catch (err) {
      logString += ` [Error stringifying log data: ${err.message}]`;
    }
  }
  
  return logString;
}

// Logger object
const logger = {
  // Set log level
  setLogLevel: (level) => {
    if (LOG_LEVELS[level] !== undefined) {
      currentLogLevel = LOG_LEVELS[level];
    }
  },
  
  // Debug level logs
  debug: (message, data) => {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      console.log(formatLog('DEBUG', message, data));
    }
  },
  
  // Info level logs
  info: (message, data) => {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      console.log(formatLog('INFO', message, data));
    }
  },
  
  // Warning level logs
  warn: (message, data) => {
    if (currentLogLevel <= LOG_LEVELS.WARN) {
      console.warn(formatLog('WARN', message, data));
    }
  },
  
  // Error level logs
  error: (message, data) => {
    if (currentLogLevel <= LOG_LEVELS.ERROR) {
      console.error(formatLog('ERROR', message, data));
    }
  },
  
  // Sanitize data
  sanitize
};

module.exports = logger; 