const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ImportBatch = sequelize.define('ImportBatch', {
  import_batch_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  file_name: { type: DataTypes.STRING(255), allowNull: false },
  intake_id: { type: DataTypes.INTEGER, allowNull: false },
  regulation_id: { type: DataTypes.INTEGER, allowNull: false },
  uploaded_by: { type: DataTypes.INTEGER, allowNull: false },
  uploaded_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  total_records: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  successful_records: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  failed_records: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  status: {
    type: DataTypes.ENUM('Processing', 'Completed', 'Failed'),
    allowNull: false,
    defaultValue: 'Processing',
  },
}, {
  tableName: 'import_batch',
});

module.exports = ImportBatch;
