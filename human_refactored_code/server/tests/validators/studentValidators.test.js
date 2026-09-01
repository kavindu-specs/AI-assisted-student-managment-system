const {
  profileUpdateSchema, documentUploadSchema, courseRegistrationSchema,
} = require('../../src/validators/studentValidators');

describe('profileUpdateSchema', () => {
  it('accepts an empty object - every field is optional', () => {
    expect(profileUpdateSchema.safeParse({}).success).toBe(true);
  });

  it('accepts a partial update with just one field', () => {
    expect(profileUpdateSchema.safeParse({ contact_no: '0771234567' }).success).toBe(true);
  });

  it('rejects an invalid email when provided', () => {
    expect(profileUpdateSchema.safeParse({ email: 'not-an-email' }).success).toBe(false);
  });

  it('rejects a gender outside the enum', () => {
    expect(profileUpdateSchema.safeParse({ gender: 'Unspecified' }).success).toBe(false);
  });

  it('accepts a valid ISO date_of_birth', () => {
    expect(profileUpdateSchema.safeParse({ date_of_birth: '2001-05-14' }).success).toBe(true);
  });

  it('rejects a malformed date_of_birth', () => {
    expect(profileUpdateSchema.safeParse({ date_of_birth: '14/05/2001' }).success).toBe(false);
  });
});

describe('documentUploadSchema', () => {
  it.each([
    'NIC Copy', 'Birth Certificate', 'Admission Letter', 'Medical Certificate', 'School Certificate', 'Other',
  ])('accepts docType "%s"', (docType) => {
    expect(documentUploadSchema.safeParse({ docType }).success).toBe(true);
  });

  it('rejects a docType outside the allowed list', () => {
    expect(documentUploadSchema.safeParse({ docType: 'Passport' }).success).toBe(false);
  });

  it('rejects a missing docType', () => {
    expect(documentUploadSchema.safeParse({}).success).toBe(false);
  });
});

describe('courseRegistrationSchema', () => {
  it('accepts a semesterId and a non-empty array of positive course IDs', () => {
    expect(courseRegistrationSchema.safeParse({ semesterId: 3, courseIds: [1, 2, 3] }).success).toBe(true);
  });

  it('rejects an empty courseIds array', () => {
    expect(courseRegistrationSchema.safeParse({ semesterId: 3, courseIds: [] }).success).toBe(false);
  });

  it('rejects non-integer or non-positive course IDs', () => {
    expect(courseRegistrationSchema.safeParse({ semesterId: 3, courseIds: [1.5] }).success).toBe(false);
    expect(courseRegistrationSchema.safeParse({ semesterId: 3, courseIds: [-1] }).success).toBe(false);
  });

  it('rejects a missing semesterId', () => {
    expect(courseRegistrationSchema.safeParse({ courseIds: [1] }).success).toBe(false);
  });
});
