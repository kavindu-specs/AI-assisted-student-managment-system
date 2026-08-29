const levels = ['error', 'warn', 'info', 'debug'];

function log(level, ...args) {
  const timestamp = new Date().toISOString();
  const method = level === 'debug' ? 'log' : level;
  // eslint-disable-next-line no-console
  console[method](`[${timestamp}] [${level.toUpperCase()}]`, ...args);
}

const logger = {};
levels.forEach((level) => {
  logger[level] = (...args) => log(level, ...args);
});

module.exports = logger;
