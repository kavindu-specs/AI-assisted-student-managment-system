const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserAccount = sequelize.define('UserAccount', {
  user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: true, unique: true },
  username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  account_status: {
    type: DataTypes.ENUM('Active', 'Inactive', 'Locked'),
    allowNull: false,
    defaultValue: 'Active',
  },
  is_2fa_enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  last_login_at: { type: DataTypes.DATE, allowNull: true },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'user_account',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = UserAccount;
