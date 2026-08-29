const app = require('./src/app');
const sequelize = require('./src/config/db');
const env = require('./src/config/env');
const logger = require('./src/utils/logger');
require('./src/models'); // ensure all associations are registered

async function start() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established.');

    app.listen(env.port, () => {
      logger.info(`Server listening on port ${env.port} (${env.nodeEnv})`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
