const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserAccount = sequelize.define('UserAccount', {
  user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive', 'Locked'),
    allowNull: false,
    defaultValue: 'Inactive',
  },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  last_login: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'user_account',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = UserAccount;
