const { z } = require('zod');

const personalDetailsSchema = z.object({
  full_name: z.string().min(1).optional(),
  name_with_initials: z.string().min(1).optional(),
  date_of_birth: z.string().date().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
});

const contactFamilySchema = z.object({
  address_line_1: z.string().optional(),
  address_line_2: z.string().optional(),
  district: z.string().optional(),
  gs_division: z.string().optional(),
  electorate: z.string().optional(),
  mobile_phone: z.string().optional(),
  land_phone: z.string().optional(),
  email: z.string().email().optional(),
  guardian_name: z.string().optional(),
  guardian_relationship: z.string().optional(),
  guardian_phone: z.string().optional(),
  emergency_contact: z.string().optional(),
});

const documentUploadSchema = z.object({
  documentType: z.enum([
    'NIC Copy', 'Birth Certificate', 'Admission Letter', 'Medical Certificate', 'School Certificate', 'Other',
  ]),
});

const mediaUploadSchema = z.object({
  mediaType: z.enum(['Profile Photo', 'Signature']),
});

const courseRegistrationSchema = z.object({
  semesterId: z.number().int().positive(),
  courseIds: z.array(z.number().int().positive()).min(1),
});

module.exports = {
  personalDetailsSchema,
  contactFamilySchema,
  documentUploadSchema,
  mediaUploadSchema,
  courseRegistrationSchema,
};
