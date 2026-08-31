const {
  bulkImportSchema,
  approvalDecisionSchema,
  courseRegistrationDecisionSchema,
  documentVerificationSchema,
  correctionRequestSchema,
  correctionDecisionSchema,
} = require('../../src/validators/adminValidators');

describe('bulkImportSchema', () => {
  it('coerces string IDs (as multipart/form-data always sends) to numbers', () => {
    const result = bulkImportSchema.safeParse({ programmeId: '1', intakeId: '2', regulationId: '3' });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ programmeId: 1, intakeId: 2, regulationId: 3 });
  });

  it('rejects a non-numeric ID', () => {
    expect(bulkImportSchema.safeParse({ programmeId: 'abc', intakeId: '2', regulationId: '3' }).success).toBe(false);
  });

  it('rejects a zero or negative ID', () => {
    expect(bulkImportSchema.safeParse({ programmeId: '0', intakeId: '2', regulationId: '3' }).success).toBe(false);
  });
});

describe('approvalDecisionSchema', () => {
  it('accepts a non-empty studentIds array with an optional reason', () => {
    expect(approvalDecisionSchema.safeParse({ studentIds: [1, 2] }).success).toBe(true);
    expect(approvalDecisionSchema.safeParse({ studentIds: [1], reason: 'duplicate NIC' }).success).toBe(true);
  });

  it('rejects an empty studentIds array', () => {
    expect(approvalDecisionSchema.safeParse({ studentIds: [] }).success).toBe(false);
  });
});

describe('courseRegistrationDecisionSchema', () => {
  it('accepts a non-empty registrationIds array', () => {
    expect(courseRegistrationDecisionSchema.safeParse({ registrationIds: [10, 11] }).success).toBe(true);
  });

  it('rejects a missing registrationIds field', () => {
    expect(courseRegistrationDecisionSchema.safeParse({}).success).toBe(false);
  });
});

describe('documentVerificationSchema', () => {
  it('accepts isVerified true with no reason', () => {
    expect(documentVerificationSchema.safeParse({ isVerified: true }).success).toBe(true);
  });

  it('accepts isVerified false with a reason', () => {
    expect(documentVerificationSchema.safeParse({ isVerified: false, reason: 'Blurry scan' }).success).toBe(true);
  });

  it('rejects a non-boolean isVerified', () => {
    expect(documentVerificationSchema.safeParse({ isVerified: 'true' }).success).toBe(false);
  });
});

describe('correctionRequestSchema', () => {
  it('accepts an empty object - justification is optional', () => {
    expect(correctionRequestSchema.safeParse({}).success).toBe(true);
  });
});

describe('correctionDecisionSchema', () => {
  it.each(['Approved', 'Rejected', 'Completed'])('accepts status "%s"', (status) => {
    expect(correctionDecisionSchema.safeParse({ status }).success).toBe(true);
  });

  it('rejects "Pending" - that is only a valid initial/default value, not a decision', () => {
    expect(correctionDecisionSchema.safeParse({ status: 'Pending' }).success).toBe(false);
  });
});
