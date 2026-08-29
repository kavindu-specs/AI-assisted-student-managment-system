const path = require('path');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/responseFormatter');
const studentService = require('../services/studentService');
const courseRegistrationService = require('../services/courseRegistrationService');
const AppError = require('../utils/AppError');
const { StudentDocument, StudentMedia } = require('../models');

const getMyProfile = asyncHandler(async (req, res) => {
  const data = await studentService.getFullProfile(req.user.studentId);
  return success(res, data);
});

const updatePersonalDetails = asyncHandler(async (req, res) => {
  const student = await studentService.updatePersonalDetails(req.user.studentId, req.body);
  return success(res, student, 'Personal details updated');
});

const updateContactFamilyInfo = asyncHandler(async (req, res) => {
  const profile = await studentService.updateContactAndFamilyInfo(req.user.studentId, req.body);
  return success(res, profile, 'Profile updated');
});

const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('A file is required', 422);
  const document = await studentService.uploadDocument(
    req.user.studentId,
    req.user.userId,
    req.body.documentType,
    req.file,
  );
  return success(res, document, 'Document uploaded', 201);
});

const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('A file is required', 422);
  const media = await studentService.uploadMedia(
    req.user.studentId,
    req.user.userId,
    req.body.mediaType,
    req.file,
  );
  return success(res, media, 'File uploaded', 201);
});

const getMyDocumentFile = asyncHandler(async (req, res) => {
  const document = await StudentDocument.findOne({
    where: { document_id: req.params.documentId, student_id: req.user.studentId },
  });
  if (!document) throw new AppError('Document not found', 404);
  return res.sendFile(path.resolve(process.cwd(), document.file_path));
});

const getMyMediaFile = asyncHandler(async (req, res) => {
  const media = await StudentMedia.findOne({
    where: { media_id: req.params.mediaId, student_id: req.user.studentId },
  });
  if (!media) throw new AppError('File not found', 404);
  return res.sendFile(path.resolve(process.cwd(), media.file_path));
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
  updatePersonalDetails,
  updateContactFamilyInfo,
  uploadDocument,
  uploadMedia,
  getMyDocumentFile,
  getMyMediaFile,
  getAvailableCourses,
  submitCourseRegistration,
};
