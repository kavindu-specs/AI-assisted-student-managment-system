const { Student } = require('../models');
const { Op } = require('sequelize');

/**
 * Format: <FACULTY_CODE>/<ADMISSION_YEAR>/<4-digit sequence>
 * e.g. AG/2026/0081
 */
async function generateRegistrationNo(facultyCode, admissionYear) {
  const prefix = `${facultyCode}/${admissionYear}/`;
  const last = await Student.findOne({
    where: { registration_no: { [Op.like]: `${prefix}%` } },
    order: [['registration_no', 'DESC']],
  });

  let nextSeq = 1;
  if (last && last.registration_no) {
    const parts = last.registration_no.split('/');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!Number.isNaN(lastSeq)) nextSeq = lastSeq + 1;
  }

  return `${prefix}${String(nextSeq).padStart(4, '0')}`;
}

module.exports = { generateRegistrationNo };
