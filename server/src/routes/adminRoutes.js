const express = require('express');
const adminController = require('../controllers/adminController');
const validateRequest = require('../middleware/validateRequest');
const { spreadsheetUpload } = require('../middleware/uploadMiddleware');
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/constants');
const {
  bulkImportSchema,
  approvalDecisionSchema,
  courseRegistrationDecisionSchema,
  documentVerificationSchema,
  correctionRequestSchema,
  correctionDecisionSchema,
} = require('../validators/adminValidators');

const router = express.Router();

router.use(authenticate, requireRole(ROLES.ADMIN));

router.get('/students', adminController.listStudents);
router.get('/students/:studentId', adminController.getStudent);
router.post(
  '/students/:decision(approve|reject)',
  validateRequest(approvalDecisionSchema),
  adminController.decideStudents,
);

router.post(
  '/imports',
  spreadsheetUpload.single('file'),
  validateRequest(bulkImportSchema),
  adminController.bulkImportStudents,
);
router.post(
  '/imports/:batchId/corrections',
  validateRequest(correctionRequestSchema),
  adminController.createCorrectionRequest,
);
router.get('/imports/:batchId/corrections', adminController.listCorrectionRequests);
router.patch(
  '/corrections/:correctionId',
  validateRequest(correctionDecisionSchema),
  adminController.decideCorrectionRequest,
);

router.get('/documents/:documentId/file', adminController.getDocumentFile);
router.patch(
  '/documents/:documentId/verify',
  validateRequest(documentVerificationSchema),
  adminController.verifyDocument,
);
router.get('/photos/:photoId/file', adminController.getPhotoFile);
router.get('/signatures/:signatureId/file', adminController.getSignatureFile);

router.post(
  '/course-registrations/:decision(approve|reject)',
  validateRequest(courseRegistrationDecisionSchema),
  adminController.decideCourseRegistrations,
);

router.get('/reports/summary', adminController.getReportsSummary);

module.exports = router;
