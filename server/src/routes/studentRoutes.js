const express = require('express');
const studentController = require('../controllers/studentController');
const validateRequest = require('../middleware/validateRequest');
const { documentUpload } = require('../middleware/uploadMiddleware');
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/constants');
const {
  personalDetailsSchema, contactFamilySchema, documentUploadSchema, mediaUploadSchema, courseRegistrationSchema,
} = require('../validators/studentValidators');

const router = express.Router();

router.use(authenticate, requireRole(ROLES.STUDENT));

router.get('/me/profile', studentController.getMyProfile);
router.patch('/me/personal-details', validateRequest(personalDetailsSchema), studentController.updatePersonalDetails);
router.patch('/me/contact-family', validateRequest(contactFamilySchema), studentController.updateContactFamilyInfo);

router.post(
  '/me/documents',
  documentUpload.single('file'),
  validateRequest(documentUploadSchema),
  studentController.uploadDocument,
);
router.post(
  '/me/media',
  documentUpload.single('file'),
  validateRequest(mediaUploadSchema),
  studentController.uploadMedia,
);
router.get('/me/documents/:documentId/file', studentController.getMyDocumentFile);
router.get('/me/media/:mediaId/file', studentController.getMyMediaFile);

router.get('/me/courses/available', studentController.getAvailableCourses);
router.post(
  '/me/courses/register',
  validateRequest(courseRegistrationSchema),
  studentController.submitCourseRegistration,
);

module.exports = router;
