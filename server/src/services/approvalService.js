const {
  Student, UserAccount, Role, Programme, Department, Faculty, Intake, sequelize,
} = require('../models');
const AppError = require('../utils/AppError');
const { generateRegistrationNo } = require('../utils/registrationNumber');
const { generateTempPassword, hash } = require('../utils/password');
const notificationService = require('./notificationService');
const auditService = require('./auditService');
const { STUDENT_STATUS, ROLES } = require('../config/constants');

async function loadStudentWithFaculty(studentId) {
  const student = await Student.findByPk(studentId, {
    include: [{ model: Programme, include: [{ model: Department, include: [Faculty] }] }, Intake],
  });
  if (!student) throw new AppError('Student not found', 404);
  return student;
}

async function approveStudent(studentId, adminUserId) {
  const student = await loadStudentWithFaculty(studentId);
  if (student.student_status !== STUDENT_STATUS.PENDING) {
    throw new AppError(`Student is already ${student.student_status}`, 409);
  }

  const facultyCode = student.Programme.Department.Faculty.faculty_code;
  const admissionYear = student.Intake.admission_year;

  const account = await sequelize.transaction(async (t) => {
    const registrationNo = await generateRegistrationNo(facultyCode, admissionYear);
    const username = registrationNo.replace(/\//g, '');
    const tempPassword = generateTempPassword();

    const created = await UserAccount.create({
      student_id: student.student_id,
      username,
      email: `${username.toLowerCase()}@students.rjt.ac.lk`,
      password_hash: await hash(tempPassword),
      is_2fa_enabled: false,
    }, { transaction: t });

    const studentRole = await Role.findOne({ where: { role_name: ROLES.STUDENT }, transaction: t });
    if (studentRole) await created.addRole(studentRole, { transaction: t });

    await student.update({
      student_status: STUDENT_STATUS.APPROVED,
      registration_no: registrationNo,
      registration_date: new Date(),
    }, { transaction: t });

    created.setDataValue('_tempPassword', tempPassword);
    return created;
  });

  await auditService.record({
    userId: adminUserId,
    studentId: student.student_id,
    entityType: 'student',
    entityId: student.student_id,
    action: 'APPROVE',
    newValue: { student_status: STUDENT_STATUS.APPROVED, registration_no: student.registration_no },
  });

  await notificationService.notify({
    userId: account.user_id,
    type: 'ACCOUNT_CREATED',
    channel: 'Email',
    subject: 'Your Rajarata University student account',
    message: `Registration No: ${student.registration_no}\nUsername: ${account.username}\nTemporary Password: ${account.getDataValue('_tempPassword')}\nThis password is valid for 7 days.`,
    to: account.email,
  });

  return { student, account };
}

async function rejectStudent(studentId, adminUserId, reason) {
  const student = await loadStudentWithFaculty(studentId);
  if (student.student_status !== STUDENT_STATUS.PENDING) {
    throw new AppError(`Student is already ${student.student_status}`, 409);
  }

  await student.update({ student_status: STUDENT_STATUS.REJECTED });

  await auditService.record({
    userId: adminUserId,
    studentId: student.student_id,
    entityType: 'student',
    entityId: student.student_id,
    action: 'REJECT',
    reason,
  });

  return student;
}

async function bulkDecide(studentIds, decision, adminUserId, reason) {
  const results = [];
  for (const studentId of studentIds) {
    try {
      const outcome = decision === 'approve'
        ? await approveStudent(studentId, adminUserId)
        : await rejectStudent(studentId, adminUserId, reason);
      results.push({ studentId, success: true, data: outcome });
    } catch (err) {
      results.push({ studentId, success: false, error: err.message });
    }
  }
  return results;
}

module.exports = { approveStudent, rejectStudent, bulkDecide };
