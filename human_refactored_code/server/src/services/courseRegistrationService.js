const {
  Student, Course, CourseRegistration, CourseRegistrationItem, Semester, sequelize,
} = require('../models');
const AppError = require('../utils/AppError');
const auditService = require('./auditService');
const {
  MIN_REGISTRATION_CREDITS, MAX_REGISTRATION_CREDITS, COURSE_REGISTRATION_STATUS, STUDENT_CURRENT_STATUS,
} = require('../config/constants');

//add soe validation to check if the student is eligible to register for courses in the given semester
async function assertEligible(studentId, semesterId) {
  if (!Number.isInteger(studentId) || studentId <= 0) {
    throw new AppError('A valid student ID is required', 422);
  }
  if (!Number.isInteger(semesterId) || semesterId <= 0) {
    throw new AppError('A valid semester ID is required', 422);
  }

  const student = await Student.findByPk(studentId);
  if (!student) throw new AppError('Student not found', 404);
  if (student.current_status !== STUDENT_CURRENT_STATUS.REGISTERED) {
    throw new AppError('Only registered students can register for courses', 403);
  }

  const semester = await Semester.findByPk(semesterId);
  if (!semester) throw new AppError('Semester not found', 404);

  return { student, semester };
}

// The refined schema has no programme-course catalog, so every active course
// is offered to every eligible student - there's nothing left to scope by.
async function getAvailableCourses(studentId, semesterId) {
  await assertEligible(studentId, semesterId);
  return Course.findAll({ order: [['course_code', 'ASC']] });
}

async function submitRegistration(studentId, semesterId, courseIds) {
  if (!Array.isArray(courseIds) || courseIds.length === 0) {
    throw new AppError('At least one course must be selected', 422);
  }
  if (courseIds.some((courseId) => !Number.isInteger(courseId) || courseId <= 0)) {
    throw new AppError('Course IDs must be positive integers', 422);
  }
  const uniqueIds = new Set(courseIds);
  if (uniqueIds.size !== courseIds.length) {
    throw new AppError('Duplicate courses are not allowed in one registration', 422);
  }

  await assertEligible(studentId, semesterId);

  const courses = await Course.findAll({ where: { course_id: courseIds } });
  if (courses.length !== courseIds.length) {
    throw new AppError('One or more selected courses do not exist', 422);
  }

  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  if (totalCredits < MIN_REGISTRATION_CREDITS || totalCredits > MAX_REGISTRATION_CREDITS) {
    throw new AppError(
      `Total credits (${totalCredits}) must be between ${MIN_REGISTRATION_CREDITS} and ${MAX_REGISTRATION_CREDITS}`,
      422,
    );
  }

  const registration = await sequelize.transaction(async (t) => {
    const [reg] = await CourseRegistration.findOrCreate({
      where: { student_id: studentId, semester_id: semesterId },
      defaults: { student_id: studentId, semester_id: semesterId },
      transaction: t,
    });

    if (reg.status === COURSE_REGISTRATION_STATUS.APPROVED) {
      throw new AppError('This semester\'s course registration is already approved', 409);
    }

    await CourseRegistrationItem.destroy({ where: { registration_id: reg.registration_id }, transaction: t });

    const courseById = new Map(courses.map((c) => [c.course_id, c]));
    await CourseRegistrationItem.bulkCreate(
      courseIds.map((courseId) => ({
        registration_id: reg.registration_id,
        course_id: courseId,
        is_elective: courseById.get(courseId).is_elective,
        is_compulsory: !courseById.get(courseId).is_elective,
      })),
      { transaction: t },
    );

    await reg.update({
      status: COURSE_REGISTRATION_STATUS.SUBMITTED,
      registration_date: new Date(),
    }, { transaction: t });

    return reg;
  });

  return getRegistrationWithItems(registration.registration_id);
}

async function getRegistrationWithItems(registrationId) {
  return CourseRegistration.findByPk(registrationId, {
    include: [{ model: CourseRegistrationItem, include: [Course] }],
  });
}

async function decideRegistration(registrationId, decision, adminUserId) {
  if (!Number.isInteger(registrationId) || registrationId <= 0) {
    throw new AppError('A valid registration ID is required', 422);
  }
  if (decision !== 'approve' && decision !== 'reject') {
    throw new AppError('Decision must be approve or reject', 422);
  }

  const registration = await CourseRegistration.findByPk(registrationId);
  if (!registration) throw new AppError('Course registration not found', 404);
  if (registration.status !== COURSE_REGISTRATION_STATUS.SUBMITTED) {
    throw new AppError('Only submitted registrations can be decided', 409);
  }

  const nextStatus = decision === 'approve' ? COURSE_REGISTRATION_STATUS.APPROVED : COURSE_REGISTRATION_STATUS.REJECTED;
  await registration.update({ status: nextStatus });

  await auditService.record({
    actorId: adminUserId,
    action: nextStatus.toUpperCase(),
    entityName: 'course_registration',
    entityId: registration.registration_id,
  });

  return registration;
}

module.exports = {
  getAvailableCourses,
  submitRegistration,
  getRegistrationWithItems,
  decideRegistration,
};
