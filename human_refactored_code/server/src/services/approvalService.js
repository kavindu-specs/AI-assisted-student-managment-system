const { Student, UserAccount, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const { generateTempPassword, hash } = require('../utils/password');
const notificationService = require('./notificationService');
const auditService = require('./auditService');
const { STUDENT_CURRENT_STATUS, STUDENT_ACCOUNT_STATUS, USER_ACCOUNT_STATUS } = require('../config/constants');

async function loadProspectiveStudent(studentId) {
  const student = await Student.findByPk(studentId);
  if (!student) throw new AppError('Student not found', 404);
  if (student.current_status !== STUDENT_CURRENT_STATUS.PROSPECTIVE) {
    throw new AppError(`Student is already ${student.current_status}`, 409);
  }
  return student;
}

async function approveStudent(studentId, adminUserId) {
  const student = await loadProspectiveStudent(studentId);
  const account = await UserAccount.findByPk(studentId);
  if (!account) throw new AppError('This student has no account record', 500);

  const tempPassword = generateTempPassword();

  await sequelize.transaction(async (t) => {
    await account.update({
      password_hash: await hash(tempPassword),
      status: USER_ACCOUNT_STATUS.ACTIVE,
    }, { transaction: t });

    await student.update({
      current_status: STUDENT_CURRENT_STATUS.REGISTERED,
      account_status: STUDENT_ACCOUNT_STATUS.ACTIVE,
    }, { transaction: t });
  });

  await auditService.record({
    actorId: adminUserId,
    action: 'APPROVE',
    entityName: 'student',
    entityId: student.student_id,
    description: `Approved ${student.reg_number}`,
  });

  await notificationService.notify({
    userId: account.user_id,
    title: 'Your Rajarata University student account',
    message: `Registration No: ${student.reg_number}\nUsername: ${account.username}\nTemporary Password: ${tempPassword}\nThis password is valid for 7 days.`,
    email: account.email,
  });

  return { student, account, tempPassword };
}

async function rejectStudent(studentId, adminUserId, reason) {
  const student = await loadProspectiveStudent(studentId);

  await student.update({ account_status: STUDENT_ACCOUNT_STATUS.SUSPENDED });

  await auditService.record({
    actorId: adminUserId,
    action: 'REJECT',
    entityName: 'student',
    entityId: student.student_id,
    description: reason || null,
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
