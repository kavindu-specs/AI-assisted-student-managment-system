const express = require('express');
const studentController = require('../controllers/studentController');
const validateRequest = require('../middleware/validateRequest');
const { documentUpload } = require('../middleware/uploadMiddleware');
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/constants');
const {
  profileUpdateSchema, documentUploadSchema, courseRegistrationSchema,
} = require('../validators/studentValidators');

const router = express.Router();

router.use(authenticate, requireRole(ROLES.STUDENT));

router.get('/me/profile', studentController.getMyProfile);
router.patch('/me/profile', validateRequest(profileUpdateSchema), studentController.updateMyProfile);

router.post('/me/photo', documentUpload.single('file'), studentController.uploadPhoto);
router.post('/me/signature', documentUpload.single('file'), studentController.uploadSignature);
router.post(
  '/me/documents',
  documentUpload.single('file'),
  validateRequest(documentUploadSchema),
  studentController.uploadDocument,
);

router.get('/me/photo/:photoId/file', studentController.getMyPhotoFile);
router.get('/me/signature/:signatureId/file', studentController.getMySignatureFile);
router.get('/me/documents/:documentId/file', studentController.getMyDocumentFile);

router.get('/me/courses/available', studentController.getAvailableCourses);
router.post(
  '/me/courses/register',
  validateRequest(courseRegistrationSchema),
  studentController.submitCourseRegistration,
);

module.exports = router;
