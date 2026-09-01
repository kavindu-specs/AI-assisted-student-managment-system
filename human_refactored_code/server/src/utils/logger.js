const levels = ['error', 'warn', 'info', 'debug'];
const levelPriority = { error: 0, warn: 1, info: 2, debug: 3 };
const configuredLevel = process.env.LOG_LEVEL || 'info';

function log(level, ...args) {
  if (levelPriority[level] > (levelPriority[configuredLevel] ?? levelPriority.info)) return;
  const timestamp = new Date().toISOString();
  const method = level === 'debug' ? 'log' : level;
  // eslint-disable-next-line no-console
  console[method](`[${timestamp}] [${level.toUpperCase()}] [pid:${process.pid}]`, ...args);
}

const logger = {};
levels.forEach((level) => {
  logger[level] = (...args) => log(level, ...args);
});

module.exports = logger;
