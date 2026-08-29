const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CourseRegistrationItem = sequelize.define('CourseRegistrationItem', {
  registration_item_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  course_registration_id: { type: DataTypes.INTEGER, allowNull: false },
  course_id: { type: DataTypes.INTEGER, allowNull: false },
  selection_type: {
    type: DataTypes.ENUM('Compulsory', 'Elective'),
    allowNull: false,
    defaultValue: 'Compulsory',
  },
  status: {
    type: DataTypes.ENUM('Registered', 'Dropped'),
    allowNull: false,
    defaultValue: 'Registered',
  },
}, {
  tableName: 'course_registration_item',
  indexes: [{ unique: true, fields: ['course_registration_id', 'course_id'] }],
});

module.exports = CourseRegistrationItem;
