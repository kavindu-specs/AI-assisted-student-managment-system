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
});

module.exports = sequelize;
