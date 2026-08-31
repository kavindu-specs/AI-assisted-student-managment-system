const { Sequelize } = require('sequelize');
const env = require('./env');
const logger = require('../utils/logger');

const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'mysql',
  logging: env.nodeEnv === 'development' ? (msg) => logger.debug(msg) : false,
  define: {
    underscored: true,
    timestamps: false, // each table declares its own timestamp columns explicitly
  },
  // Each clustered worker process gets its own Sequelize instance with its
  // own pool - MySQL sees up to (poolMax * CLUSTER_WORKERS) connections
  // total, so keep poolMax modest rather than defaulting per-instance.
  pool: {
    max: env.db.poolMax,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = sequelize;
