const sequelize = require('../config/db');

const Faculty = require('./Faculty');
const Department = require('./Department');
const Programme = require('./Programme');
const Intake = require('./Intake');
const AcademicRegulation = require('./AcademicRegulation');
const Student = require('./Student');
const StudentProfile = require('./StudentProfile');
const UserAccount = require('./UserAccount');
const Role = require('./Role');
const UserRole = require('./UserRole');
const AcademicYear = require('./AcademicYear');
const Semester = require('./Semester');
const StudentSemesterRegistration = require('./StudentSemesterRegistration');
const Course = require('./Course');
const ProgrammeCourse = require('./ProgrammeCourse');
const CourseRegistration = require('./CourseRegistration');
const CourseRegistrationItem = require('./CourseRegistrationItem');
const StudentMedia = require('./StudentMedia');
const StudentDocument = require('./StudentDocument');
const ImportBatch = require('./ImportBatch');
const ImportBatchRecord = require('./ImportBatchRecord');
const AuditLog = require('./AuditLog');
const Notification = require('./Notification');

// Faculty -> Department -> Programme
Faculty.hasMany(Department, { foreignKey: 'faculty_id' });
Department.belongsTo(Faculty, { foreignKey: 'faculty_id' });

Department.hasMany(Programme, { foreignKey: 'department_id' });
Programme.belongsTo(Department, { foreignKey: 'department_id' });

// Student core relations
Programme.hasMany(Student, { foreignKey: 'programme_id' });
Student.belongsTo(Programme, { foreignKey: 'programme_id' });

Intake.hasMany(Student, { foreignKey: 'intake_id' });
Student.belongsTo(Intake, { foreignKey: 'intake_id' });

AcademicRegulation.hasMany(Student, { foreignKey: 'regulation_id' });
Student.belongsTo(AcademicRegulation, { foreignKey: 'regulation_id' });

Student.hasOne(StudentProfile, { foreignKey: 'student_id' });
StudentProfile.belongsTo(Student, { foreignKey: 'student_id' });

Student.hasOne(UserAccount, { foreignKey: 'student_id' });
UserAccount.belongsTo(Student, { foreignKey: 'student_id' });

// Roles (many-to-many via user_role)
UserAccount.belongsToMany(Role, { through: UserRole, foreignKey: 'user_id', otherKey: 'role_id' });
Role.belongsToMany(UserAccount, { through: UserRole, foreignKey: 'role_id', otherKey: 'user_id' });

// Academic calendar
AcademicYear.hasMany(Semester, { foreignKey: 'academic_year_id' });
Semester.belongsTo(AcademicYear, { foreignKey: 'academic_year_id' });

Student.hasMany(StudentSemesterRegistration, { foreignKey: 'student_id' });
StudentSemesterRegistration.belongsTo(Student, { foreignKey: 'student_id' });

Semester.hasMany(StudentSemesterRegistration, { foreignKey: 'semester_id' });
StudentSemesterRegistration.belongsTo(Semester, { foreignKey: 'semester_id' });

UserAccount.hasMany(StudentSemesterRegistration, { foreignKey: 'registered_by' });
StudentSemesterRegistration.belongsTo(UserAccount, { foreignKey: 'registered_by', as: 'registeredBy' });

// Programme <-> Course catalogue
Programme.belongsToMany(Course, { through: ProgrammeCourse, foreignKey: 'programme_id', otherKey: 'course_id' });
Course.belongsToMany(Programme, { through: ProgrammeCourse, foreignKey: 'course_id', otherKey: 'programme_id' });
Programme.hasMany(ProgrammeCourse, { foreignKey: 'programme_id' });
ProgrammeCourse.belongsTo(Programme, { foreignKey: 'programme_id' });
Course.hasMany(ProgrammeCourse, { foreignKey: 'course_id' });
ProgrammeCourse.belongsTo(Course, { foreignKey: 'course_id' });

// Course registration
Student.hasMany(CourseRegistration, { foreignKey: 'student_id' });
CourseRegistration.belongsTo(Student, { foreignKey: 'student_id' });

Semester.hasMany(CourseRegistration, { foreignKey: 'semester_id' });
CourseRegistration.belongsTo(Semester, { foreignKey: 'semester_id' });

UserAccount.hasMany(CourseRegistration, { foreignKey: 'approved_by' });
CourseRegistration.belongsTo(UserAccount, { foreignKey: 'approved_by', as: 'approvedBy' });

CourseRegistration.hasMany(CourseRegistrationItem, { foreignKey: 'course_registration_id' });
CourseRegistrationItem.belongsTo(CourseRegistration, { foreignKey: 'course_registration_id' });

Course.hasMany(CourseRegistrationItem, { foreignKey: 'course_id' });
CourseRegistrationItem.belongsTo(Course, { foreignKey: 'course_id' });

// Media & documents
Student.hasMany(StudentMedia, { foreignKey: 'student_id' });
StudentMedia.belongsTo(Student, { foreignKey: 'student_id' });
UserAccount.hasMany(StudentMedia, { foreignKey: 'uploaded_by' });
StudentMedia.belongsTo(UserAccount, { foreignKey: 'uploaded_by', as: 'uploadedBy' });
UserAccount.hasMany(StudentMedia, { foreignKey: 'verified_by' });
StudentMedia.belongsTo(UserAccount, { foreignKey: 'verified_by', as: 'verifiedBy' });

Student.hasMany(StudentDocument, { foreignKey: 'student_id' });
StudentDocument.belongsTo(Student, { foreignKey: 'student_id' });
UserAccount.hasMany(StudentDocument, { foreignKey: 'uploaded_by' });
StudentDocument.belongsTo(UserAccount, { foreignKey: 'uploaded_by', as: 'uploadedBy' });
UserAccount.hasMany(StudentDocument, { foreignKey: 'verified_by' });
StudentDocument.belongsTo(UserAccount, { foreignKey: 'verified_by', as: 'verifiedBy' });

// Bulk import
Intake.hasMany(ImportBatch, { foreignKey: 'intake_id' });
ImportBatch.belongsTo(Intake, { foreignKey: 'intake_id' });
AcademicRegulation.hasMany(ImportBatch, { foreignKey: 'regulation_id' });
ImportBatch.belongsTo(AcademicRegulation, { foreignKey: 'regulation_id' });
UserAccount.hasMany(ImportBatch, { foreignKey: 'uploaded_by' });
ImportBatch.belongsTo(UserAccount, { foreignKey: 'uploaded_by', as: 'uploadedBy' });

ImportBatch.hasMany(ImportBatchRecord, { foreignKey: 'import_batch_id' });
ImportBatchRecord.belongsTo(ImportBatch, { foreignKey: 'import_batch_id' });
Student.hasMany(ImportBatchRecord, { foreignKey: 'student_id' });
ImportBatchRecord.belongsTo(Student, { foreignKey: 'student_id' });

// Audit & notifications
UserAccount.hasMany(AuditLog, { foreignKey: 'user_id' });
AuditLog.belongsTo(UserAccount, { foreignKey: 'user_id' });
Student.hasMany(AuditLog, { foreignKey: 'student_id' });
AuditLog.belongsTo(Student, { foreignKey: 'student_id' });

UserAccount.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(UserAccount, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  Faculty,
  Department,
  Programme,
  Intake,
  AcademicRegulation,
  Student,
  StudentProfile,
  UserAccount,
  Role,
  UserRole,
  AcademicYear,
  Semester,
  StudentSemesterRegistration,
  Course,
  ProgrammeCourse,
  CourseRegistration,
  CourseRegistrationItem,
  StudentMedia,
  StudentDocument,
  ImportBatch,
  ImportBatchRecord,
  AuditLog,
  Notification,
};
