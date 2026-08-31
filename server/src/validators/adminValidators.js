const { z } = require('zod');

const bulkImportSchema = z.object({
  programmeId: z.coerce.number().int().positive(),
  intakeId: z.coerce.number().int().positive(),
  regulationId: z.coerce.number().int().positive(),
});

const approvalDecisionSchema = z.object({
  studentIds: z.array(z.number().int().positive()).min(1),
  reason: z.string().optional(),
});

const courseRegistrationDecisionSchema = z.object({
  registrationIds: z.array(z.number().int().positive()).min(1),
});

const documentVerificationSchema = z.object({
  isVerified: z.boolean(),
  reason: z.string().optional(),
});

const correctionRequestSchema = z.object({
  justification: z.string().optional(),
});

const correctionDecisionSchema = z.object({
  status: z.enum(['Approved', 'Rejected', 'Completed']),
});

module.exports = {
  bulkImportSchema,
  approvalDecisionSchema,
  courseRegistrationDecisionSchema,
  documentVerificationSchema,
  correctionRequestSchema,
  correctionDecisionSchema,
};
