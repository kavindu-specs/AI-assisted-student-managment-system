const fs = require('fs');
const XLSX = require('xlsx');
const {
  ImportBatch, Student, StudentAccount, StudentProfile, UserAccount, Role, Programme, Intake, sequelize,
} = require('../models');
const AppError = require('../utils/AppError');
const { generateRegistrationNo } = require('../utils/registrationNumber');
const { generateTempPassword, hash } = require('../utils/password');
const { calculateCompletionPct } = require('../utils/profileCompletion');
const {
  VALIDATION_STATUS, IMPORT_BATCH_STATUS, USER_ACCOUNT_STATUS, ROLES,
} = require('../config/constants');

//initiated chunked size
const NIC_REGEX = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
const BULK_IMPORT_CHUNK_SIZE = 100;

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

function validateRow({
  fullName, nic, dob, gender,
}, isDuplicateNic) {
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
 * Parses the uploaded sheet, validates every row, and creates a full
 * identity (UserAccount + Student + StudentAccount + StudentProfile) for
 * every row that passes validation - required because `student_id` is a FK
 * to `user_account.user_id` (ISA subtype), so a Student can't exist without
 * an account. The account is created Inactive/unusable; approval activates it.
 *
 * The schema has no per-row import table, so validation results are
 * returned in this response only (not persisted beyond the batch aggregate).
 */
async function importStudents({
  filePath, originalFileName, programmeId, intakeId, regulationId, importedByAdminId,
}) {
  const rows = readRows(filePath);
  if (rows.length === 0) throw new AppError('The uploaded file has no data rows', 422);

  const programme = await Programme.findByPk(programmeId);
  if (!programme) throw new AppError('Programme not found', 404);
  const intake = await Intake.findByPk(intakeId);
  if (!intake) throw new AppError('Intake not found', 404);

  const existingNicRows = await Student.findAll({ attributes: ['nic'] });
  const existingNicSet = new Set(existingNicRows.map((s) => s.nic));
  const seenInFile = new Set();

  const studentRole = await Role.findOne({ where: { role_name: ROLES.STUDENT } });

  let successful = 0;
  let failed = 0;
  const resultRows = [];

  // Process large student imports in fixed-size transactional chunks to reduce memory usage while preserving
  // row-level validation and accurate batch totals.
  const createdBatch = await ImportBatch.create({
    file_name: originalFileName,
    imported_by: importedByAdminId,
    total_records: rows.length,
  });

  for (let chunkStart = 0; chunkStart < rows.length; chunkStart += BULK_IMPORT_CHUNK_SIZE) {
    const chunk = rows.slice(chunkStart, chunkStart + BULK_IMPORT_CHUNK_SIZE);

    await sequelize.transaction(async (t) => {
      for (let offset = 0; offset < chunk.length; offset += 1) {
        const globalIndex = chunkStart + offset;
        const row = chunk[offset];
        const fullName = String(row['Full Name'] || '').trim();
        const nic = String(row.NIC || '').trim();
        const dob = excelDateToIso(row.DOB);
        const gender = normalizeGender(row.Gender);
        const email = String(row.Email || '').trim();
        const phone = String(row.Phone || '').trim();
        const address = String(row.Address || '').trim();

        const isDuplicate = Boolean(nic) && (existingNicSet.has(nic) || seenInFile.has(nic));
        if (nic) seenInFile.add(nic);

        const hardError = validateRow({
          fullName, nic, dob, gender,
        }, isDuplicate);
        let status = hardError ? hardError.status : VALIDATION_STATUS.VALID;
        let message = hardError ? hardError.message : null;
        let studentId = null;
        let regNumber = null;

        if (!hardError && !(email || phone || address)) {
          status = VALIDATION_STATUS.WARNING;
          message = 'No contact details (email/phone/address) supplied - profile will start incomplete';
        }

        if (status !== VALIDATION_STATUS.ERROR) {
          regNumber = await generateRegistrationNo(programme.programme_code, intake.intake_year);
          const username = regNumber.replace(/-/g, '');

          const account = await UserAccount.create({
            username,
            email: `${username.toLowerCase()}@students.rjt.ac.lk`,
            password_hash: await hash(generateTempPassword()),
            status: USER_ACCOUNT_STATUS.INACTIVE,
          }, { transaction: t });

          const student = await Student.create({
            student_id: account.user_id,
            reg_number: regNumber,
            full_name: fullName,
            nic,
            programme_id: programmeId,
            intake_id: intakeId,
            regulation_id: regulationId,
          }, { transaction: t });

          await StudentAccount.create({ student_id: student.student_id }, { transaction: t });

          const profile = { email: email || null, contact_no: phone || null, address: address || null };
          await StudentProfile.create({
            student_id: student.student_id,
            ...profile,
            date_of_birth: dob,
            gender,
            profile_completion_pct: calculateCompletionPct(profile),
          }, { transaction: t });

          if (studentRole) await account.addRole(studentRole, { transaction: t });

          studentId = student.student_id;
          successful += 1;
        } else {
          failed += 1;
        }

        resultRows.push({
          row_number: globalIndex + 1,
          reg_number: regNumber,
          nic: nic || null,
          full_name: fullName || null,
          validation_status: status,
          message,
          student_id: studentId,
        });
      }
    });
  }

  await createdBatch.update({
    valid_records: successful,
    invalid_records: failed,
    status: IMPORT_BATCH_STATUS.COMPLETED,
  });

  fs.unlink(filePath, () => {});

  return { batch: createdBatch, rows: resultRows };
}

module.exports = { importStudents };
