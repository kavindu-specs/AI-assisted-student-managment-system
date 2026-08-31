const { z } = require('zod');

const profileUpdateSchema = z.object({
  address: z.string().optional(),
  contact_no: z.string().optional(),
  email: z.string().email().optional(),
  date_of_birth: z.string().date().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  family_info: z.string().optional(),
  emergency_contact: z.string().optional(),
  other_details: z.string().optional(),
});

const documentUploadSchema = z.object({
  docType: z.enum([
    'NIC Copy', 'Birth Certificate', 'Admission Letter', 'Medical Certificate', 'School Certificate', 'Other',
  ]),
});

const courseRegistrationSchema = z.object({
  semesterId: z.number().int().positive(),
  courseIds: z.array(z.number().int().positive()).min(1),
});

module.exports = {
  profileUpdateSchema,
  documentUploadSchema,
  courseRegistrationSchema,
};
