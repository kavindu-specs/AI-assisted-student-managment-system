const { ImportBatch, CorrectionRequest } = require('../models');
const AppError = require('../utils/AppError');

async function createForBatch(batchId, adminUserId, justification) {
  const batch = await ImportBatch.findByPk(batchId);
  if (!batch) throw new AppError('Import batch not found', 404);

  return CorrectionRequest.create({
    batch_id: batchId,
    requested_by: adminUserId,
    justification: justification || null,
  });
}

async function listForBatch(batchId) {
  return CorrectionRequest.findAll({ where: { batch_id: batchId }, order: [['requested_at', 'DESC']] });
}

async function decide(correctionId, status) {
  const correction = await CorrectionRequest.findByPk(correctionId);
  if (!correction) throw new AppError('Correction request not found', 404);
  await correction.update({ status });
  return correction;
}

module.exports = { createForBatch, listForBatch, decide };
