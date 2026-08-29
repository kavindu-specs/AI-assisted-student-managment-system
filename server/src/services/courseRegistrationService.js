const {
  Student, Course, ProgrammeCourse, CourseRegistration, CourseRegistrationItem, Semester,
  StudentSemesterRegistration, sequelize,
} = require('../models');
const AppError = require('../utils/AppError');
const {
  MIN_REGISTRATION_CREDITS, MAX_REGISTRATION_CREDITS, COURSE_REGISTRATION_STATUS,
  SEMESTER_REGISTRATION_STATUS,
} = require('../config/constants');

async function getAvailableCourses(studentId, semesterId) {
  const student = await Student.findByPk(studentId);
  if (!student) throw new AppError('Student not found', 404);

  const semester = await Semester.findByPk(semesterId);
  if (!semester) throw new AppError('Semester not found', 404);

  const semesterRegistration = await StudentSemesterRegistration.findOne({
    where: { student_id: studentId, semester_id: semesterId },
  });
  if (!semesterRegistration || semesterRegistration.registration_status !== SEMESTER_REGISTRATION_STATUS.REGISTERED) {
    throw new AppError('Student is not activated for this semester yet', 403);
  }

  const offerings = await ProgrammeCourse.findAll({
    where: {
      programme_id: student.programme_id,
      semester_no: semester.semester_no,
      recommended_year: semesterRegistration.study_year,
    },
    include: [Course],
  });

  return offerings.map((o) => ({
    course: o.Course,
    course_type: o.course_type,
    is_compulsory: o.is_compulsory,
    recommended_year: o.recommended_year,
  }));
}

async function submitRegistration(studentId, semesterId, courseIds) {
  if (!Array.isArray(courseIds) || courseIds.length === 0) {
    throw new AppError('At least one course must be selected', 422);
  }
  const uniqueIds = new Set(courseIds);
  if (uniqueIds.size !== courseIds.length) {
    throw new AppError('Duplicate courses are not allowed in one registration', 422);
  }

  const offerings = await getAvailableCourses(studentId, semesterId);
  const offeredCourseIds = new Set(offerings.map((o) => o.course.course_id));
  const invalid = courseIds.filter((id) => !offeredCourseIds.has(id));
  if (invalid.length > 0) {
    throw new AppError(`Course(s) not offered for this programme/semester: ${invalid.join(', ')}`, 422);
  }

  const courses = await Course.findAll({ where: { course_id: courseIds } });
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

    await CourseRegistrationItem.destroy({ where: { course_registration_id: reg.course_registration_id }, transaction: t });

    const offeringByCourseId = new Map(offerings.map((o) => [o.course.course_id, o]));
    await CourseRegistrationItem.bulkCreate(
      courseIds.map((courseId) => ({
        course_registration_id: reg.course_registration_id,
        course_id: courseId,
        selection_type: offeringByCourseId.get(courseId).course_type,
      })),
      { transaction: t },
    );

    await reg.update({
      status: COURSE_REGISTRATION_STATUS.SUBMITTED,
      submitted_at: new Date(),
    }, { transaction: t });

    return reg;
  });

  return getRegistrationWithItems(registration.course_registration_id);
}

async function getRegistrationWithItems(courseRegistrationId) {
  return CourseRegistration.findByPk(courseRegistrationId, {
    include: [{ model: CourseRegistrationItem, include: [Course] }],
  });
}

async function decideRegistration(courseRegistrationId, decision, adminUserId) {
  const registration = await CourseRegistration.findByPk(courseRegistrationId);
  if (!registration) throw new AppError('Course registration not found', 404);
  if (registration.status !== COURSE_REGISTRATION_STATUS.SUBMITTED) {
    throw new AppError('Only submitted registrations can be decided', 409);
  }

  await registration.update({
    status: decision === 'approve' ? COURSE_REGISTRATION_STATUS.APPROVED : COURSE_REGISTRATION_STATUS.REJECTED,
    approved_at: new Date(),
    approved_by: adminUserId,
  });

  return registration;
}

module.exports = {
  getAvailableCourses,
  submitRegistration,
  getRegistrationWithItems,
  decideRegistration,
};
