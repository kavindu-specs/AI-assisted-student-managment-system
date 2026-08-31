const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Programme = sequelize.define('Programme', {
  programme_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  programme_code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  programme_name: { type: DataTypes.STRING(200), allowNull: false },
  faculty_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'programme',
});

module.exports = Programme;
