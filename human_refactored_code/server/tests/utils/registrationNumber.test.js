jest.mock('../../src/models', () => ({
  Student: { findOne: jest.fn() },
}));

const { Student } = require('../../src/models');
const { generateRegistrationNo } = require('../../src/utils/registrationNumber');

describe('generateRegistrationNo', () => {
  it('starts the sequence at 0001 when no prior student exists for this prefix', async () => {
    Student.findOne.mockResolvedValue(null);

    const regNo = await generateRegistrationNo('AGRI', 2026);

    expect(regNo).toBe('AGRI-2026-0001');
    expect(Student.findOne).toHaveBeenCalledWith(expect.objectContaining({
      order: [['reg_number', 'DESC']],
    }));
  });

  it('increments from the last matching registration number', async () => {
    Student.findOne.mockResolvedValue({ reg_number: 'AGRI-2026-0047' });

    const regNo = await generateRegistrationNo('AGRI', 2026);

    expect(regNo).toBe('AGRI-2026-0048');
  });

  it('pads the sequence to 4 digits', async () => {
    Student.findOne.mockResolvedValue({ reg_number: 'AGRI-2026-0007' });
    expect(await generateRegistrationNo('AGRI', 2026)).toBe('AGRI-2026-0008');
  });

  it('does not pad once the sequence exceeds 4 digits', async () => {
    Student.findOne.mockResolvedValue({ reg_number: 'AGRI-2026-9999' });
    expect(await generateRegistrationNo('AGRI', 2026)).toBe('AGRI-2026-10000');
  });

  it('restarts at 0001 for a different programme/intake-year prefix', async () => {
    Student.findOne.mockResolvedValue(null);
    expect(await generateRegistrationNo('SCI', 2027)).toBe('SCI-2027-0001');
  });

  it('falls back to 0001 if the stored reg_number is malformed for this prefix', async () => {
    Student.findOne.mockResolvedValue({ reg_number: 'AGRI-2026-notanumber' });
    expect(await generateRegistrationNo('AGRI', 2026)).toBe('AGRI-2026-0001');
  });
});
