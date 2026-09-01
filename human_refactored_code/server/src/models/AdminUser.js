const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// admin_id is both this table's PK and a FK -> user_account.user_id
// (class-table-inheritance / ISA subtype of USER_ACCOUNT).
const AdminUser = sequelize.define('AdminUser', {
  admin_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: false },
  institutional_email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  staff_no: { type: DataTypes.STRING(50), allowNull: true, unique: true },
  designation: { type: DataTypes.STRING(150), allowNull: true },
}, {
  tableName: 'admin_user',
  timestamps: false,
});

module.exports = AdminUser;
