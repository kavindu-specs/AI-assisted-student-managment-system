const {
  Student, StudentProfile, ProfilePhotograph, Signature, SupportingDocument, Programme, Faculty, Intake,
} = require('../models');
const AppError = require('../utils/AppError');
const storageService = require('./storageService');
const { calculateCompletionPct } = require('../utils/profileCompletion');

async function findStudentOrThrow(studentId) {
  const student = await Student.findByPk(studentId, {
    include: [{ model: Programme, include: [Faculty] }, Intake],
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

async function refreshCompletionPct(studentId) {
  const profile = await getOrCreateProfile(studentId);
  const [hasPhoto, hasSignature, documentCount] = await Promise.all([
    ProfilePhotograph.count({ where: { student_id: studentId, is_active: true } }),
    Signature.count({ where: { student_id: studentId, is_active: true } }),
    SupportingDocument.count({ where: { student_id: studentId } }),
  ]);

  const pct = calculateCompletionPct(profile, {
    hasPhoto: hasPhoto > 0,
    hasSignature: hasSignature > 0,
    hasDocument: documentCount > 0,
  });
  await profile.update({ profile_completion_pct: pct });
  return profile;
}

async function getFullProfile(studentId) {
  const student = await findStudentOrThrow(studentId);
  const profile = await getOrCreateProfile(studentId);
  const [photo] = await ProfilePhotograph.findAll({ where: { student_id: studentId, is_active: true } });
  const [signature] = await Signature.findAll({ where: { student_id: studentId, is_active: true } });
  const documents = await SupportingDocument.findAll({ where: { student_id: studentId } });
  return {
    student, profile, photo: photo || null, signature: signature || null, documents,
  };
}

async function updateProfile(studentId, data) {
  const profile = await getOrCreateProfile(studentId);
  const allowed = [
    'address', 'contact_no', 'email', 'date_of_birth', 'gender', 'family_info', 'emergency_contact', 'other_details',
  ];
  const updates = {};
  allowed.forEach((key) => {
    if (data[key] !== undefined) updates[key] = data[key];
  });
  await profile.update(updates);
  return refreshCompletionPct(studentId);
}

async function uploadPhoto(studentId, file) {
  await findStudentOrThrow(studentId);
  const relativePath = await storageService.persist(file.path, { studentId, category: 'photo' });

  await ProfilePhotograph.update(
    { is_active: false },
    { where: { student_id: studentId, is_active: true } },
  );
  const photo = await ProfilePhotograph.create({ student_id: studentId, file_path: relativePath });

  await refreshCompletionPct(studentId);
  return photo;
}

async function uploadSignature(studentId, file) {
  await findStudentOrThrow(studentId);
  const relativePath = await storageService.persist(file.path, { studentId, category: 'signature' });

  await Signature.update(
    { is_active: false },
    { where: { student_id: studentId, is_active: true } },
  );
  const signature = await Signature.create({ student_id: studentId, file_path: relativePath });

  await refreshCompletionPct(studentId);
  return signature;
}

async function uploadDocument(studentId, docType, file) {
  await findStudentOrThrow(studentId);
  const relativePath = await storageService.persist(file.path, { studentId, category: 'documents' });

  const document = await SupportingDocument.create({
    student_id: studentId,
    doc_type: docType,
    file_path: relativePath,
  });

  await refreshCompletionPct(studentId);
  return document;
}

module.exports = {
  findStudentOrThrow,
  getOrCreateProfile,
  getFullProfile,
  updateProfile,
  uploadPhoto,
  uploadSignature,
  uploadDocument,
  refreshCompletionPct,
};
