module.exports = {
  ROLES: {
    ADMIN: 'admin',
    STUDENT: 'student',
  },

  // user_account.status
  USER_ACCOUNT_STATUS: {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    LOCKED: 'Locked',
  },

  // student.account_status - Inactive (not yet approved) / Active / Suspended (rejected or disciplinary)
  STUDENT_ACCOUNT_STATUS: {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    SUSPENDED: 'Suspended',
  },

  // student.current_status - the academic lifecycle stage
  STUDENT_CURRENT_STATUS: {
    PROSPECTIVE: 'Prospective',
    REGISTERED: 'Registered',
    GRADUATED: 'Graduated',
    RELEASED: 'Released',
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

  CORRECTION_REQUEST_STATUS: {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    COMPLETED: 'Completed',
  },

  COURSE_REGISTRATION_STATUS: {
    DRAFT: 'Draft',
    SUBMITTED: 'Submitted',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
  },

  NOTIFICATION_TYPE: {
    INFO: 'Info',
    SUCCESS: 'Success',
    WARNING: 'Warning',
    ERROR: 'Error',
  },

  MIN_REGISTRATION_CREDITS: 15,
  MAX_REGISTRATION_CREDITS: 22,
};
