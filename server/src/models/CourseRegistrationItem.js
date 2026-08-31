const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CourseRegistrationItem = sequelize.define('CourseRegistrationItem', {
  item_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  registration_id: { type: DataTypes.INTEGER, allowNull: false },
  course_id: { type: DataTypes.INTEGER, allowNull: false },
  is_compulsory: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  is_elective: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  selected_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'course_registration_item',
  timestamps: false,
  indexes: [{ unique: true, fields: ['registration_id', 'course_id'] }],
});

module.exports = CourseRegistrationItem;
