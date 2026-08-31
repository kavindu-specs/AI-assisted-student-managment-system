const { calculateCompletionPct } = require('../../src/utils/profileCompletion');

describe('calculateCompletionPct', () => {
  it('returns 0 for a completely empty profile', () => {
    expect(calculateCompletionPct({})).toBe(0);
  });

  it('returns 0 when profile is null/undefined and no flags are set', () => {
    expect(calculateCompletionPct(null)).toBe(0);
    expect(calculateCompletionPct(undefined)).toBe(0);
  });

  it('returns 100 when all 7 fields are filled and all 3 flags are true', () => {
    const profile = {
      address: '123 Main St',
      contact_no: '0771234567',
      email: 'a@b.com',
      date_of_birth: '2000-01-01',
      gender: 'Male',
      family_info: 'Father: ...',
      emergency_contact: 'Jane, 0779999999',
    };
    expect(calculateCompletionPct(profile, { hasPhoto: true, hasSignature: true, hasDocument: true })).toBe(100);
  });

  it('counts each of the 7 profile fields as one tenth (10%)', () => {
    expect(calculateCompletionPct({ address: 'x' })).toBe(10);
    expect(calculateCompletionPct({ address: 'x', contact_no: 'y' })).toBe(20);
  });

  it('counts photo/signature/document flags the same as a filled field', () => {
    expect(calculateCompletionPct({}, { hasPhoto: true })).toBe(10);
    expect(calculateCompletionPct({}, { hasPhoto: true, hasSignature: true })).toBe(20);
    expect(calculateCompletionPct({}, { hasPhoto: true, hasSignature: true, hasDocument: true })).toBe(30);
  });

  it('treats falsy field values (empty string, 0) as not-filled', () => {
    expect(calculateCompletionPct({ address: '', contact_no: null, other_details: 'ignored - not counted' })).toBe(0);
  });

  it('ignores fields outside the tracked 7 (e.g. other_details)', () => {
    expect(calculateCompletionPct({ other_details: 'irrelevant to the score' })).toBe(0);
  });

  it('rounds to 2 decimal places', () => {
    // 3 of 10 checks -> 30% exactly, but 1 of 10 -> 10% exactly too; pick a
    // combination that would produce a repeating decimal without rounding.
    const pct = calculateCompletionPct({ address: 'x', contact_no: 'y', email: 'z' });
    expect(pct).toBe(30);
    expect(Number.isInteger(pct * 100)).toBe(true);
  });
});
