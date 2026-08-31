const { Op } = require('sequelize');
const { Student } = require('../models');

/**
 * Format: <PROGRAMME_CODE>-<INTAKE_YEAR>-<4-digit sequence>
 * e.g. AGRI-2026-0001
 */
async function generateRegistrationNo(programmeCode, intakeYear) {
  const prefix = `${programmeCode}-${intakeYear}-`;
  const last = await Student.findOne({
    where: { reg_number: { [Op.like]: `${prefix}%` } },
    order: [['reg_number', 'DESC']],
  });

  let nextSeq = 1;
  if (last && last.reg_number) {
    const parts = last.reg_number.split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!Number.isNaN(lastSeq)) nextSeq = lastSeq + 1;
  }

  return `${prefix}${String(nextSeq).padStart(4, '0')}`;
}

module.exports = { generateRegistrationNo };
