const path = require('path');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/responseFormatter');
const AppError = require('../utils/AppError');
const {
  Student, Programme, Faculty, ProfilePhotograph, Signature, SupportingDocument,
} = require('../models');
const bulkImportService = require('../services/bulkImportService');
const approvalService = require('../services/approvalService');
const courseRegistrationService = require('../services/courseRegistrationService');
const reportService = require('../services/reportService');
const correctionRequestService = require('../services/correctionRequestService');
const auditService = require('../services/auditService');

const listStudents = asyncHandler(async (req, res) => {
  const { status, programmeId } = req.query;
  const where = {};
  if (status) where.current_status = status;
  if (programmeId) where.programme_id = programmeId;

  const students = await Student.findAll({
    where,
    include: [{ model: Programme, include: [Faculty] }],
  });
  return success(res, students);
});

const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByPk(req.params.studentId, {
    include: [{ model: Programme, include: [Faculty] }],
  });
  if (!student) throw new AppError('Student not found', 404);
  return success(res, student);
});

const bulkImportStudents = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('A spreadsheet file is required', 422);
  const { programmeId, intakeId, regulationId } = req.body;

  const result = await bulkImportService.importStudents({
    filePath: req.file.path,
    originalFileName: req.file.originalname,
    programmeId,
    intakeId,
    regulationId,
    importedByAdminId: req.user.userId,
  });

  return success(res, result, 'Import processed', 201);
});

const decideStudents = asyncHandler(async (req, res) => {
  const { decision } = req.params;
  if (!['approve', 'reject'].includes(decision)) throw new AppError('Invalid decision', 400);
  const { studentIds, reason } = req.body;

  const results = await approvalService.bulkDecide(studentIds, decision, req.user.userId, reason);
  return success(res, results, `Students ${decision}d`);
});

const verifyDocument = asyncHandler(async (req, res) => {
  const document = await SupportingDocument.findByPk(req.params.documentId);
  if (!document) throw new AppError('Document not found', 404);

  const { isVerified, reason } = req.body;
  await document.update({
    is_verified: isVerified,
    verified_by: req.user.userId,
    verified_at: new Date(),
  });

  await auditService.record({
    actorId: req.user.userId,
    action: isVerified ? 'DOCUMENT_VERIFIED' : 'DOCUMENT_REJECTED',
    entityName: 'supporting_document',
    entityId: document.document_id,
    description: reason || null,
  });

  return success(res, document, 'Document verification updated');
});

const getDocumentFile = asyncHandler(async (req, res) => {
  const document = await SupportingDocument.findByPk(req.params.documentId);
  if (!document) throw new AppError('Document not found', 404);
  return res.sendFile(path.resolve(process.cwd(), document.file_path));
});

const getPhotoFile = asyncHandler(async (req, res) => {
  const photo = await ProfilePhotograph.findByPk(req.params.photoId);
  if (!photo) throw new AppError('Photo not found', 404);
  return res.sendFile(path.resolve(process.cwd(), photo.file_path));
});

const getSignatureFile = asyncHandler(async (req, res) => {
  const signature = await Signature.findByPk(req.params.signatureId);
  if (!signature) throw new AppError('Signature not found', 404);
  return res.sendFile(path.resolve(process.cwd(), signature.file_path));
});

const decideCourseRegistrations = asyncHandler(async (req, res) => {
  const { decision } = req.params;
  if (!['approve', 'reject'].includes(decision)) throw new AppError('Invalid decision', 400);
  const { registrationIds } = req.body;

  const results = await Promise.all(registrationIds.map((id) => (
    courseRegistrationService.decideRegistration(id, decision, req.user.userId)
  )));

  return success(res, results, `Course registrations ${decision}d`);
});

const createCorrectionRequest = asyncHandler(async (req, res) => {
  const correction = await correctionRequestService.createForBatch(
    req.params.batchId,
    req.user.userId,
    req.body.justification,
  );
  return success(res, correction, 'Correction request raised', 201);
});

const listCorrectionRequests = asyncHandler(async (req, res) => {
  const corrections = await correctionRequestService.listForBatch(req.params.batchId);
  return success(res, corrections);
});

const decideCorrectionRequest = asyncHandler(async (req, res) => {
  const correction = await correctionRequestService.decide(req.params.correctionId, req.body.status);
  return success(res, correction, 'Correction request updated');
});

const getReportsSummary = asyncHandler(async (req, res) => {
  const [summary, facultyDistribution, monthlyCourseRegistrations] = await Promise.all([
    reportService.getSummary(),
    reportService.getFacultyDistribution(),
    reportService.getMonthlyCourseRegistrations(req.query.year),
  ]);
  return success(res, { summary, facultyDistribution, monthlyCourseRegistrations });
});

module.exports = {
  listStudents,
  getStudent,
  bulkImportStudents,
  decideStudents,
  verifyDocument,
  getDocumentFile,
  getPhotoFile,
  getSignatureFile,
  decideCourseRegistrations,
  createCorrectionRequest,
  listCorrectionRequests,
  decideCorrectionRequest,
  getReportsSummary,
};
