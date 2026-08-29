const {
  Student, StudentProfile, StudentMedia, StudentDocument, Programme, Department, Faculty, Intake,
} = require('../models');
const AppError = require('../utils/AppError');
const storageService = require('./storageService');
const { PROFILE_COMPLETION_STATUS } = require('../config/constants');

async function findStudentOrThrow(studentId) {
  const student = await Student.findByPk(studentId, {
    include: [
      { model: Programme, include: [{ model: Department, include: [Faculty] }] },
      Intake,
    ],
  });
  if (!student) throw new AppError('Student not found', 404);
  return student;
}

async function getOrCreateProfile(studentId) {
  const [profile] = await StudentProfile.findOrCreate({
    where: { student_id: studentId },
    defaults: { student_id: studentId },
  });
  return profile;
}

function computeCompletionStatus(profile, documentCount) {
  const contactFilled = Boolean(profile.address_line_1 && profile.district && profile.mobile_phone);
  const guardianFilled = Boolean(profile.guardian_name && profile.guardian_phone);
  const emergencyFilled = Boolean(profile.emergency_contact);

  if (contactFilled && guardianFilled && emergencyFilled && documentCount > 0) {
    return PROFILE_COMPLETION_STATUS.COMPLETED;
  }
  if (contactFilled || guardianFilled || emergencyFilled || documentCount > 0) {
    return PROFILE_COMPLETION_STATUS.IN_PROGRESS;
  }
  return PROFILE_COMPLETION_STATUS.NOT_STARTED;
}

async function refreshCompletionStatus(studentId) {
  const profile = await getOrCreateProfile(studentId);
  const documentCount = await StudentDocument.count({ where: { student_id: studentId } });
  const status = computeCompletionStatus(profile, documentCount);
  await profile.update({ profile_completion_status: status });
  return profile;
}

async function getFullProfile(studentId) {
  const student = await findStudentOrThrow(studentId);
  const profile = await getOrCreateProfile(studentId);
  const media = await StudentMedia.findAll({ where: { student_id: studentId, is_current: true } });
  const documents = await StudentDocument.findAll({ where: { student_id: studentId } });
  return { student, profile, media, documents };
}

async function updatePersonalDetails(studentId, data) {
  const student = await findStudentOrThrow(studentId);
  const allowed = ['full_name', 'name_with_initials', 'date_of_birth', 'gender'];
  const updates = {};
  allowed.forEach((key) => {
    if (data[key] !== undefined) updates[key] = data[key];
  });
  await student.update(updates);
  return student;
}

async function updateContactAndFamilyInfo(studentId, data) {
  const profile = await getOrCreateProfile(studentId);
  const allowed = [
    'address_line_1', 'address_line_2', 'district', 'gs_division', 'electorate',
    'mobile_phone', 'land_phone', 'email',
    'guardian_name', 'guardian_relationship', 'guardian_phone', 'emergency_contact',
  ];
  const updates = {};
  allowed.forEach((key) => {
    if (data[key] !== undefined) updates[key] = data[key];
  });
  await profile.update(updates);
  await refreshCompletionStatus(studentId);
  return profile;
}

async function uploadDocument(studentId, uploadedByUserId, documentType, file) {
  await findStudentOrThrow(studentId);
  const relativePath = await storageService.persist(file.path, { studentId, category: 'documents' });

  const document = await StudentDocument.create({
    student_id: studentId,
    document_type: documentType,
    file_path: relativePath,
    file_name: file.originalname,
    uploaded_by: uploadedByUserId,
  });

  await refreshCompletionStatus(studentId);
  return document;
}

async function uploadMedia(studentId, uploadedByUserId, mediaType, file) {
  await findStudentOrThrow(studentId);
  const relativePath = await storageService.persist(file.path, { studentId, category: 'media' });

  await StudentMedia.update(
    { is_current: false },
    { where: { student_id: studentId, media_type: mediaType, is_current: true } },
  );

  const media = await StudentMedia.create({
    student_id: studentId,
    media_type: mediaType,
    file_path: relativePath,
    file_name: file.originalname,
    mime_type: file.mimetype,
    uploaded_by: uploadedByUserId,
  });

  return media;
}

module.exports = {
  findStudentOrThrow,
  getOrCreateProfile,
  getFullProfile,
  updatePersonalDetails,
  updateContactAndFamilyInfo,
  uploadDocument,
  uploadMedia,
  refreshCompletionStatus,
};
