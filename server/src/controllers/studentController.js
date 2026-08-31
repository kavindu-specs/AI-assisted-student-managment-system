const path = require('path');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/responseFormatter');
const studentService = require('../services/studentService');
const courseRegistrationService = require('../services/courseRegistrationService');
const AppError = require('../utils/AppError');
const { ProfilePhotograph, Signature, SupportingDocument } = require('../models');

const getMyProfile = asyncHandler(async (req, res) => {
  const data = await studentService.getFullProfile(req.user.studentId);
  return success(res, data);
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const profile = await studentService.updateProfile(req.user.studentId, req.body);
  return success(res, profile, 'Profile updated');
});

const uploadPhoto = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('A file is required', 422);
  const photo = await studentService.uploadPhoto(req.user.studentId, req.file);
  return success(res, photo, 'Photo uploaded', 201);
});

const uploadSignature = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('A file is required', 422);
  const signature = await studentService.uploadSignature(req.user.studentId, req.file);
  return success(res, signature, 'Signature uploaded', 201);
});

const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('A file is required', 422);
  const document = await studentService.uploadDocument(req.user.studentId, req.body.docType, req.file);
  return success(res, document, 'Document uploaded', 201);
});

const getMyPhotoFile = asyncHandler(async (req, res) => {
  const photo = await ProfilePhotograph.findOne({
    where: { photo_id: req.params.photoId, student_id: req.user.studentId },
  });
  if (!photo) throw new AppError('Photo not found', 404);
  return res.sendFile(path.resolve(process.cwd(), photo.file_path));
});

const getMySignatureFile = asyncHandler(async (req, res) => {
  const signature = await Signature.findOne({
    where: { signature_id: req.params.signatureId, student_id: req.user.studentId },
  });
  if (!signature) throw new AppError('Signature not found', 404);
  return res.sendFile(path.resolve(process.cwd(), signature.file_path));
});

const getMyDocumentFile = asyncHandler(async (req, res) => {
  const document = await SupportingDocument.findOne({
    where: { document_id: req.params.documentId, student_id: req.user.studentId },
  });
  if (!document) throw new AppError('Document not found', 404);
  return res.sendFile(path.resolve(process.cwd(), document.file_path));
});

const getAvailableCourses = asyncHandler(async (req, res) => {
  const semesterId = Number(req.query.semesterId);
  if (!semesterId) throw new AppError('semesterId query parameter is required', 422);
  const offerings = await courseRegistrationService.getAvailableCourses(req.user.studentId, semesterId);
  return success(res, offerings);
});

const submitCourseRegistration = asyncHandler(async (req, res) => {
  const { semesterId, courseIds } = req.body;
  const registration = await courseRegistrationService.submitRegistration(req.user.studentId, semesterId, courseIds);
  return success(res, registration, 'Course registration submitted');
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadPhoto,
  uploadSignature,
  uploadDocument,
  getMyPhotoFile,
  getMySignatureFile,
  getMyDocumentFile,
  getAvailableCourses,
  submitCourseRegistration,
};
