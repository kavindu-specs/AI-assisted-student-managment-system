const { z } = require('zod');

// Validates student profile and registration input at the API boundary,
// ensuring consistent data types, required fields, and allowed values
// before the request reaches the service layer.

const profileUpdateSchema = z.object({
  address: z.string().max(500).optional(),
  contact_no: z.string().min(8).max(20).optional(),
  email: z.string().email().optional(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  family_info: z.string().max(1000).optional(),
  emergency_contact: z.string().max(100).optional(),
  other_details: z.string().max(1000).optional(),
}).strict();

const documentUploadSchema = z.object({
  docType: z.enum(['nic', 'birthCertificate', 'photo', 'signature', 'transcript']),
  category: z.enum(['student', 'admin']).optional(),
}).strict();

const courseRegistrationSchema = z.object({
  semesterId: z.number().int().positive(),
  courseIds: z.array(z.number().int().positive()).min(1),
}).strict();

module.exports = {
  profileUpdateSchema,
  documentUploadSchema,
  courseRegistrationSchema,
};