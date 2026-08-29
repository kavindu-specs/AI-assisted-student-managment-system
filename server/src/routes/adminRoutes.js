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
  semesterActivationSchema,
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
router.get('/imports/:batchId', adminController.getImportBatch);

router.get('/documents/:documentId/file', adminController.getDocumentFile);
router.patch(
  '/documents/:documentId/verify',
  validateRequest(documentVerificationSchema),
  adminController.verifyDocument,
);
router.get('/media/:mediaId/file', adminController.getMediaFile);
router.patch(
  '/media/:mediaId/verify',
  validateRequest(documentVerificationSchema),
  adminController.verifyMedia,
);

router.post(
  '/semester-registrations/activate',
  validateRequest(semesterActivationSchema),
  adminController.activateSemesterRegistration,
);

router.post(
  '/course-registrations/:decision(approve|reject)',
  validateRequest(courseRegistrationDecisionSchema),
  adminController.decideCourseRegistrations,
);

router.get('/reports/summary', adminController.getReportsSummary);

module.exports = router;
