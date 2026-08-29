const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserRole = sequelize.define('UserRole', {
  user_id: { type: DataTypes.INTEGER, primaryKey: true },
  role_id: { type: DataTypes.INTEGER, primaryKey: true },
}, {
  tableName: 'user_role',
  timestamps: false,
});

module.exports = UserRole;
