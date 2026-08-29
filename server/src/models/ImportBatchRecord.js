const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ImportBatchRecord = sequelize.define('ImportBatchRecord', {
  import_record_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  import_batch_id: { type: DataTypes.INTEGER, allowNull: false },
  row_number: { type: DataTypes.INTEGER, allowNull: false },
  registration_no: { type: DataTypes.STRING(30), allowNull: true },
  nic_no: { type: DataTypes.STRING(20), allowNull: true },
  student_name: { type: DataTypes.STRING(150), allowNull: true },
  validation_status: { type: DataTypes.ENUM('Valid', 'Warning', 'Error'), allowNull: false },
  error_message: { type: DataTypes.STRING(500), allowNull: true },
  student_id: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'import_batch_record',
});

module.exports = ImportBatchRecord;
