module.exports = {
  ROLES: {
    ADMIN: 'admin',
    STUDENT: 'student',
  },

  STUDENT_STATUS: {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    ACTIVE: 'Active',
    SUSPENDED: 'Suspended',
    GRADUATED: 'Graduated',
    WITHDRAWN: 'Withdrawn',
  },

  ACCOUNT_STATUS: {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    LOCKED: 'Locked',
  },

  PROFILE_COMPLETION_STATUS: {
    NOT_STARTED: 'Not Started',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
  },

  VERIFICATION_STATUS: {
    PENDING: 'Pending',
    VERIFIED: 'Verified',
    REJECTED: 'Rejected',
  },

  VALIDATION_STATUS: {
    VALID: 'Valid',
    WARNING: 'Warning',
    ERROR: 'Error',
  },

  IMPORT_BATCH_STATUS: {
    PROCESSING: 'Processing',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
  },

  COURSE_REGISTRATION_STATUS: {
    DRAFT: 'Draft',
    SUBMITTED: 'Submitted',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
  },

  SEMESTER_REGISTRATION_STATUS: {
    PENDING: 'Pending',
    REGISTERED: 'Registered',
    CANCELLED: 'Cancelled',
  },

  COURSE_TYPE: {
    COMPULSORY: 'Compulsory',
    ELECTIVE: 'Elective',
  },

  DOCUMENT_TYPE: {
    NIC_COPY: 'NIC Copy',
    BIRTH_CERTIFICATE: 'Birth Certificate',
    ADMISSION_LETTER: 'Admission Letter',
    MEDICAL_CERTIFICATE: 'Medical Certificate',
    SCHOOL_CERTIFICATE: 'School Certificate',
    OTHER: 'Other',
  },

  MEDIA_TYPE: {
    PROFILE_PHOTO: 'Profile Photo',
    SIGNATURE: 'Signature',
  },

  MIN_REGISTRATION_CREDITS: 15,
  MAX_REGISTRATION_CREDITS: 22,
};
