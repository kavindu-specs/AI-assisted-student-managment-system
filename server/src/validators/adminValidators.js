const { z } = require('zod');

const bulkImportSchema = z.object({
  intakeId: z.coerce.number().int().positive(),
  regulationId: z.coerce.number().int().positive(),
  programmeId: z.coerce.number().int().positive(),
});

const approvalDecisionSchema = z.object({
  studentIds: z.array(z.number().int().positive()).min(1),
  reason: z.string().optional(),
});

const courseRegistrationDecisionSchema = z.object({
  courseRegistrationIds: z.array(z.number().int().positive()).min(1),
});

const documentVerificationSchema = z.object({
  status: z.enum(['Verified', 'Rejected']),
  rejectionReason: z.string().optional(),
});

const semesterActivationSchema = z.object({
  studentIds: z.array(z.number().int().positive()).min(1),
  semesterId: z.number().int().positive(),
  studyYear: z.number().int().positive(),
});

module.exports = {
  bulkImportSchema,
  approvalDecisionSchema,
  courseRegistrationDecisionSchema,
  documentVerificationSchema,
  semesterActivationSchema,
};
