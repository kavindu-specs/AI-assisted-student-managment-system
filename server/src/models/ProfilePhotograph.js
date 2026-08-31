const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProfilePhotograph = sequelize.define('ProfilePhotograph', {
  photo_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  file_path: { type: DataTypes.STRING(255), allowNull: false },
  uploaded_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  tableName: 'profile_photograph',
  timestamps: false,
});

module.exports = ProfilePhotograph;
