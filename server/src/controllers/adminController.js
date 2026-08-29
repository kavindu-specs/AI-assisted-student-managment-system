const path = require('path');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/responseFormatter');
const AppError = require('../utils/AppError');
const {
  Student, Programme, Department, Faculty, StudentDocument, StudentMedia, StudentSemesterRegistration,
} = require('../models');
const bulkImportService = require('../services/bulkImportService');
const approvalService = require('../services/approvalService');
const courseRegistrationService = require('../services/courseRegistrationService');
const reportService = require('../services/reportService');
const auditService = require('../services/auditService');
const { VERIFICATION_STATUS, SEMESTER_REGISTRATION_STATUS } = require('../config/constants');

const listStudents = asyncHandler(async (req, res) => {
  const { status, programmeId } = req.query;
  const where = {};
  if (status) where.student_status = status;
  if (programmeId) where.programme_id = programmeId;

  const students = await Student.findAll({
    where,
    include: [{ model: Programme, include: [{ model: Department, include: [Faculty] }] }],
    order: [['created_at', 'DESC']],
  });
  return success(res, students);
});

const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByPk(req.params.studentId, {
    include: [{ model: Programme, include: [{ model: Department, include: [Faculty] }] }],
  });
  if (!student) throw new AppError('Student not found', 404);
  return success(res, student);
});

const bulkImportStudents = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('A spreadsheet file is required', 422);
  const { intakeId, regulationId, programmeId } = req.body;

  const result = await bulkImportService.importStudents({
    filePath: req.file.path,
    originalFileName: req.file.originalname,
    intakeId,
    regulationId,
    programmeId,
    uploadedByUserId: req.user.userId,
  });

  return success(res, result, 'Import processed', 201);
});

const getImportBatch = asyncHandler(async (req, res) => {
  const result = await bulkImportService.getBatchWithRecords(req.params.batchId);
  return success(res, result);
});

const decideStudents = asyncHandler(async (req, res) => {
  const { decision } = req.params;
  if (!['approve', 'reject'].includes(decision)) throw new AppError('Invalid decision', 400);
  const { studentIds, reason } = req.body;

  const results = await approvalService.bulkDecide(studentIds, decision, req.user.userId, reason);
  return success(res, results, `Students ${decision}d`);
});

const verifyDocument = asyncHandler(async (req, res) => {
  const document = await StudentDocument.findByPk(req.params.documentId);
  if (!document) throw new AppError('Document not found', 404);

  const { status, rejectionReason } = req.body;
  await document.update({
    verification_status: status,
    verified_by: req.user.userId,
    verified_at: new Date(),
    rejection_reason: status === VERIFICATION_STATUS.REJECTED ? rejectionReason : null,
  });

  await auditService.record({
    userId: req.user.userId,
    studentId: document.student_id,
    entityType: 'student_document',
    entityId: document.document_id,
    action: `DOCUMENT_${status.toUpperCase()}`,
  });

  return success(res, document, 'Document verification updated');
});

const getDocumentFile = asyncHandler(async (req, res) => {
  const document = await StudentDocument.findByPk(req.params.documentId);
  if (!document) throw new AppError('Document not found', 404);
  return res.sendFile(path.resolve(process.cwd(), document.file_path));
});

const getMediaFile = asyncHandler(async (req, res) => {
  const media = await StudentMedia.findByPk(req.params.mediaId);
  if (!media) throw new AppError('File not found', 404);
  return res.sendFile(path.resolve(process.cwd(), media.file_path));
});

const verifyMedia = asyncHandler(async (req, res) => {
  const media = await StudentMedia.findByPk(req.params.mediaId);
  if (!media) throw new AppError('Media not found', 404);

  const { status, rejectionReason } = req.body;
  await media.update({
    verification_status: status,
    verified_by: req.user.userId,
    verified_at: new Date(),
    rejection_reason: status === VERIFICATION_STATUS.REJECTED ? rejectionReason : null,
  });

  return success(res, media, 'Media verification updated');
});

const activateSemesterRegistration = asyncHandler(async (req, res) => {
  const { studentIds, semesterId, studyYear } = req.body;

  const results = await Promise.all(studentIds.map(async (studentId) => {
    const [record] = await StudentSemesterRegistration.findOrCreate({
      where: { student_id: studentId, semester_id: semesterId },
      defaults: {
        student_id: studentId,
        semester_id: semesterId,
        study_year: studyYear,
        registration_status: SEMESTER_REGISTRATION_STATUS.REGISTERED,
        registered_at: new Date(),
        registered_by: req.user.userId,
      },
    });
    if (record.registration_status !== SEMESTER_REGISTRATION_STATUS.REGISTERED) {
      await record.update({
        registration_status: SEMESTER_REGISTRATION_STATUS.REGISTERED,
        study_year: studyYear,
        registered_at: new Date(),
        registered_by: req.user.userId,
      });
    }
    return record;
  }));

  return success(res, results, 'Students activated for semester registration');
});

const decideCourseRegistrations = asyncHandler(async (req, res) => {
  const { decision } = req.params;
  if (!['approve', 'reject'].includes(decision)) throw new AppError('Invalid decision', 400);
  const { courseRegistrationIds } = req.body;

  const results = await Promise.all(courseRegistrationIds.map((id) => (
    courseRegistrationService.decideRegistration(id, decision, req.user.userId)
  )));

  return success(res, results, `Course registrations ${decision}d`);
});

const getReportsSummary = asyncHandler(async (req, res) => {
  const [summary, departmentDistribution, monthlyRegistrations] = await Promise.all([
    reportService.getSummary(),
    reportService.getDepartmentDistribution(),
    reportService.getMonthlyRegistrations(req.query.year),
  ]);
  return success(res, { summary, departmentDistribution, monthlyRegistrations });
});

module.exports = {
  listStudents,
  getStudent,
  bulkImportStudents,
  getImportBatch,
  decideStudents,
  verifyDocument,
  verifyMedia,
  getDocumentFile,
  getMediaFile,
  activateSemesterRegistration,
  decideCourseRegistrations,
  getReportsSummary,
};
