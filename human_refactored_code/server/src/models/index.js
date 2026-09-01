// //Use the EER structure as the source of truth. The important pattern is:

// UserAccount ⇄ Role (many-to-many)
// UserAccount → Student (ISA)
// Student → StudentAccount (1:1)
// Student → StudentProfile (1:1)
// Student → CourseRegistration (1:N)
// CourseRegistration → CourseRegistrationItem (1:N)
// Semester → AcademicYear (N:1)
// Programme → Faculty (N:1)
// Programme → Intake (1:N)

const sequelize = require('../config/db');

const Role = require('./Role');
const Faculty = require('./Faculty');
const Programme = require('./Programme');
const Intake = require('./Intake');
const AcademicRegulation = require('./AcademicRegulation');
const AcademicYear = require('./AcademicYear');
const Semester = require('./Semester');
const Course = require('./Course');
const UserAccount = require('./UserAccount');
const UserRole = require('./UserRole');
const AdminUser = require('./AdminUser');
const Student = require('./Student');
const StudentAccount = require('./StudentAccount');
const StudentProfile = require('./StudentProfile');
const ProfilePhotograph = require('./ProfilePhotograph');
const Signature = require('./Signature');
const SupportingDocument = require('./SupportingDocument');
const CourseRegistration = require('./CourseRegistration');
const CourseRegistrationItem = require('./CourseRegistrationItem');
const ImportBatch = require('./ImportBatch');
const CorrectionRequest = require('./CorrectionRequest');
const AuditLog = require('./AuditLog');
const Notification = require('./Notification');
const OtpChallenge = require('./OtpChallenge');

Faculty.hasMany(Programme, { foreignKey: 'faculty_id' });
Programme.belongsTo(Faculty, { foreignKey: 'faculty_id' });

Programme.hasMany(Intake, { foreignKey: 'programme_id' });
Intake.belongsTo(Programme, { foreignKey: 'programme_id' });

AcademicYear.hasMany(Semester, { foreignKey: 'academic_year_id' });
Semester.belongsTo(AcademicYear, { foreignKey: 'academic_year_id' });

UserAccount.belongsToMany(Role, { through: UserRole, foreignKey: 'user_id', otherKey: 'role_id' });
Role.belongsToMany(UserAccount, { through: UserRole, foreignKey: 'role_id', otherKey: 'user_id' });

UserAccount.hasOne(AdminUser, { foreignKey: 'admin_id' });
AdminUser.belongsTo(UserAccount, { foreignKey: 'admin_id' });

UserAccount.hasOne(Student, { foreignKey: 'student_id' });
Student.belongsTo(UserAccount, { foreignKey: 'student_id' });

UserAccount.hasOne(OtpChallenge, { foreignKey: 'user_id' });
OtpChallenge.belongsTo(UserAccount, { foreignKey: 'user_id' });

Programme.hasMany(Student, { foreignKey: 'programme_id' });
Student.belongsTo(Programme, { foreignKey: 'programme_id' });

Intake.hasMany(Student, { foreignKey: 'intake_id' });
Student.belongsTo(Intake, { foreignKey: 'intake_id' });

AcademicRegulation.hasMany(Student, { foreignKey: 'regulation_id' });
Student.belongsTo(AcademicRegulation, { foreignKey: 'regulation_id' });

Student.hasOne(StudentAccount, { foreignKey: 'student_id' });
StudentAccount.belongsTo(Student, { foreignKey: 'student_id' });

Student.hasOne(StudentProfile, { foreignKey: 'student_id' });
StudentProfile.belongsTo(Student, { foreignKey: 'student_id' });

Student.hasMany(ProfilePhotograph, { foreignKey: 'student_id' });
ProfilePhotograph.belongsTo(Student, { foreignKey: 'student_id' });

Student.hasMany(Signature, { foreignKey: 'student_id' });
Signature.belongsTo(Student, { foreignKey: 'student_id' });

Student.hasMany(SupportingDocument, { foreignKey: 'student_id' });
SupportingDocument.belongsTo(Student, { foreignKey: 'student_id' });

Student.hasMany(CourseRegistration, { foreignKey: 'student_id' });
CourseRegistration.belongsTo(Student, { foreignKey: 'student_id' });

Semester.hasMany(CourseRegistration, { foreignKey: 'semester_id' });
CourseRegistration.belongsTo(Semester, { foreignKey: 'semester_id' });

CourseRegistration.hasMany(CourseRegistrationItem, { foreignKey: 'registration_id' });
CourseRegistrationItem.belongsTo(CourseRegistration, { foreignKey: 'registration_id' });

Course.hasMany(CourseRegistrationItem, { foreignKey: 'course_id' });
CourseRegistrationItem.belongsTo(Course, { foreignKey: 'course_id' });

AdminUser.hasMany(ImportBatch, { foreignKey: 'imported_by' });
ImportBatch.belongsTo(AdminUser, { foreignKey: 'imported_by', as: 'importedBy' });

ImportBatch.hasMany(CorrectionRequest, { foreignKey: 'batch_id' });
CorrectionRequest.belongsTo(ImportBatch, { foreignKey: 'batch_id' });

AdminUser.hasMany(CorrectionRequest, { foreignKey: 'requested_by' });
CorrectionRequest.belongsTo(AdminUser, { foreignKey: 'requested_by', as: 'requestedBy' });

UserAccount.hasMany(AuditLog, { foreignKey: 'actor_id' });
AuditLog.belongsTo(UserAccount, { foreignKey: 'actor_id', as: 'actor' });

UserAccount.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(UserAccount, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  Role,
  Faculty,
  Programme,
  Intake,
  AcademicRegulation,
  AcademicYear,
  Semester,
  Course,
  UserAccount,
  UserRole,
  AdminUser,
  Student,
  StudentAccount,
  StudentProfile,
  ProfilePhotograph,
  Signature,
  SupportingDocument,
  CourseRegistration,
  CourseRegistrationItem,
  ImportBatch,
  CorrectionRequest,
  AuditLog,
  Notification,
  OtpChallenge,
};