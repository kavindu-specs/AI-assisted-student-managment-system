const fs = require('fs');
const XLSX = require('xlsx');
const {
  ImportBatch, ImportBatchRecord, Student, StudentProfile, sequelize,
} = require('../models');
const AppError = require('../utils/AppError');
const {
  VALIDATION_STATUS, IMPORT_BATCH_STATUS, STUDENT_STATUS,
} = require('../config/constants');

const NIC_REGEX = /^([0-9]{9}[vVxX]|[0-9]{12})$/;

function readRows(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
}

function excelDateToIso(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

function normalizeGender(value) {
  const v = String(value || '').trim().toLowerCase();
  if (v.startsWith('m')) return 'Male';
  if (v.startsWith('f')) return 'Female';
  if (v) return 'Other';
  return null;
}

function validateRow({ fullName, nic, dob, gender }, isDuplicateNic) {
  const errors = [];
  if (!fullName) errors.push('Full Name is required');
  if (!nic) errors.push('NIC is required');
  else if (!NIC_REGEX.test(nic)) errors.push('NIC format is invalid');
  if (!dob) errors.push('DOB is required');
  if (!gender) errors.push('Gender must be Male, Female, or Other');
  if (isDuplicateNic) errors.push('NIC already registered or duplicated within this file');

  if (errors.length > 0) return { status: VALIDATION_STATUS.ERROR, message: errors.join('; ') };
  return null;
}

/**
 * Parses the uploaded sheet, validates every row, and creates real Student
 * records for rows that pass validation (or only carry a non-fatal warning),
 * all inside one transaction so the import_batch/import_batch_record audit
 * trail always matches what actually landed in `student`.
 */
async function importStudents({
  filePath, originalFileName, intakeId, regulationId, programmeId, uploadedByUserId,
}) {
  const rows = readRows(filePath);
  if (rows.length === 0) throw new AppError('The uploaded file has no data rows', 422);

  const existingNicRows = await Student.findAll({ attributes: ['nic_no'] });
  const existingNicSet = new Set(existingNicRows.map((s) => s.nic_no));
  const seenInFile = new Set();

  let successful = 0;
  let failed = 0;
  const recordRows = [];

  const result = await sequelize.transaction(async (t) => {
    const batch = await ImportBatch.create({
      file_name: originalFileName,
      intake_id: intakeId,
      regulation_id: regulationId,
      uploaded_by: uploadedByUserId,
      total_records: rows.length,
    }, { transaction: t });

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      const fullName = String(row['Full Name'] || '').trim();
      const nic = String(row['NIC'] || '').trim();
      const dob = excelDateToIso(row['DOB']);
      const gender = normalizeGender(row['Gender']);
      const indexNo = String(row['O/L Index No.'] || '').trim();
      const email = String(row['Email'] || '').trim();
      const phone = String(row['Phone'] || '').trim();
      const address = String(row['Address'] || '').trim();

      const isDuplicate = Boolean(nic) && (existingNicSet.has(nic) || seenInFile.has(nic));
      if (nic) seenInFile.add(nic);

      const hardError = validateRow({ fullName, nic, dob, gender }, isDuplicate);
      let status = hardError ? hardError.status : VALIDATION_STATUS.VALID;
      let message = hardError ? hardError.message : null;
      let studentId = null;

      if (!hardError && !indexNo) {
        status = VALIDATION_STATUS.WARNING;
        message = 'O/L Index No. is missing';
      }

      if (status !== VALIDATION_STATUS.ERROR) {
        const student = await Student.create({
          index_no: indexNo || null,
          nic_no: nic,
          full_name: fullName,
          name_with_initials: fullName,
          date_of_birth: dob,
          gender,
          student_status: STUDENT_STATUS.PENDING,
          programme_id: programmeId,
          intake_id: intakeId,
          regulation_id: regulationId,
        }, { transaction: t });

        if (email || phone || address) {
          await StudentProfile.create({
            student_id: student.student_id,
            email: email || null,
            mobile_phone: phone || null,
            address_line_1: address || null,
          }, { transaction: t });
        }

        studentId = student.student_id;
        successful += 1;
      } else {
        failed += 1;
      }

      recordRows.push({
        import_batch_id: batch.import_batch_id,
        row_number: i + 1,
        registration_no: null,
        nic_no: nic || null,
        student_name: fullName || null,
        validation_status: status,
        error_message: message,
        student_id: studentId,
      });
    }

    await ImportBatchRecord.bulkCreate(recordRows, { transaction: t });
    await batch.update({
      successful_records: successful,
      failed_records: failed,
      status: IMPORT_BATCH_STATUS.COMPLETED,
    }, { transaction: t });

    return batch;
  });

  fs.unlink(filePath, () => {});

  const records = await ImportBatchRecord.findAll({ where: { import_batch_id: result.import_batch_id } });
  return { batch: result, records };
}

async function getBatchWithRecords(importBatchId) {
  const batch = await ImportBatch.findByPk(importBatchId);
  if (!batch) throw new AppError('Import batch not found', 404);
  const records = await ImportBatchRecord.findAll({ where: { import_batch_id: importBatchId } });
  return { batch, records };
}

module.exports = { importStudents, getBatchWithRecords };
