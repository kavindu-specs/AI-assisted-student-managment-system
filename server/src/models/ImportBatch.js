const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ImportBatch = sequelize.define('ImportBatch', {
  batch_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  file_name: { type: DataTypes.STRING(255), allowNull: false },
  imported_by: { type: DataTypes.INTEGER, allowNull: false },
  import_timestamp: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  total_records: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  valid_records: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  invalid_records: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  status: {
    type: DataTypes.ENUM('Processing', 'Completed', 'Failed'),
    allowNull: false,
    defaultValue: 'Processing',
  },
}, {
  tableName: 'import_batch',
  timestamps: false,
});

module.exports = ImportBatch;
