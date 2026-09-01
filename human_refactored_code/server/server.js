const cluster = require('cluster');
const env = require('./src/config/env');
const logger = require('./src/utils/logger');

/**
 * Runs one HTTP server + its own DB connection/pool inside a worker process.
 * Each worker is a fully independent copy of the app - the OS/cluster module
 * load-balances incoming connections across whichever workers are alive.
 */
async function startWorker() {
  const app = require('./src/app'); // eslint-disable-line global-require
  const sequelize = require('./src/config/db'); // eslint-disable-line global-require
  require('./src/models'); // eslint-disable-line global-require

  try {
    await sequelize.authenticate();
    logger.info(`[worker ${process.pid}] Database connection established.`);

    const server = app.listen(env.port, () => {
      logger.info(`[worker ${process.pid}] Server listening on port ${env.port} (${env.nodeEnv})`);
    });
    server.on('error', (err) => {
      logger.error(`[worker ${process.pid}] HTTP server error:`, err);
      process.exit(1);
    });

    let shuttingDown = false;
    const shutdown = (signal) => {
      if (shuttingDown) return;
      shuttingDown = true;
      logger.info(`[worker ${process.pid}] Received ${signal}, closing gracefully...`);
      server.close(async () => {
        try {
          await sequelize.close();
          process.exit(0);
        } catch (err) {
          logger.error(`[worker ${process.pid}] Failed to close database connection:`, err);
          process.exit(1);
        }
      });
      // Force-exit if in-flight requests never drain.
      setTimeout(() => process.exit(1), 10_000).unref();
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error(`[worker ${process.pid}] Failed to start:`, err.message);
    process.exit(1);
  }
}

process.on('uncaughtException', (err) => {
  logger.error(`[process ${process.pid}] Uncaught exception:`, err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  logger.error(`[process ${process.pid}] Unhandled promise rejection:`, reason);
  process.exit(1);
});

/**
 * Forks one worker per configured slot and keeps that count topped up -
 * a worker that crashes gets replaced automatically. Holds no DB connection
 * and serves no requests itself.
 */
function startPrimary() {
  const workerCount = env.clusterWorkers;
  logger.info(`[primary ${process.pid}] Starting ${workerCount} worker(s)...`);

  for (let i = 0; i < workerCount; i += 1) cluster.fork();

  let shuttingDown = false;
  cluster.on('exit', (worker, code, signal) => {
    if (shuttingDown) return;
    logger.warn(`[primary ${process.pid}] Worker ${worker.process.pid} exited (code ${code}, signal ${signal}) - restarting it in 1s.`);
    // A short backoff keeps a persistent failure (e.g. the DB being down) from
    // turning into a tight crash-restart loop that hammers it with connections.
    setTimeout(() => {
      if (!shuttingDown) cluster.fork();
    }, 1000);
  });

  const shutdown = (signal) => {
    shuttingDown = true;
    logger.info(`[primary ${process.pid}] Received ${signal}, stopping all workers...`);
    Object.values(cluster.workers).forEach((worker) => worker.process.kill(signal));
    setTimeout(() => process.exit(0), 10_000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

if (env.clusterEnabled && env.clusterWorkers > 1 && cluster.isPrimary) {
  startPrimary();
} else {
  startWorker();
}
