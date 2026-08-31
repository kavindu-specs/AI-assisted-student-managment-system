const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// student_id is both this table's PK and a FK -> user_account.user_id
// (class-table-inheritance / ISA subtype of USER_ACCOUNT).
const Student = sequelize.define('Student', {
  student_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: false },
  reg_number: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  full_name: { type: DataTypes.STRING(150), allowNull: false },
  nic: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  programme_id: { type: DataTypes.INTEGER, allowNull: false },
  intake_id: { type: DataTypes.INTEGER, allowNull: false },
  regulation_id: { type: DataTypes.INTEGER, allowNull: false },
  account_status: {
    type: DataTypes.ENUM('Active', 'Inactive', 'Suspended'),
    allowNull: false,
    defaultValue: 'Inactive',
  },
  current_status: {
    type: DataTypes.ENUM('Prospective', 'Registered', 'Graduated', 'Released'),
    allowNull: false,
    defaultValue: 'Prospective',
  },
}, {
  tableName: 'student',
  timestamps: false,
});

module.exports = Student;
