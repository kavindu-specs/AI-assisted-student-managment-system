jest.mock('../../src/models', () => ({
  ImportBatch: { findByPk: jest.fn() },
  CorrectionRequest: {
    create: jest.fn(), findAll: jest.fn(), findByPk: jest.fn(),
  },
}));

const { ImportBatch, CorrectionRequest } = require('../../src/models');
const correctionRequestService = require('../../src/services/correctionRequestService');

describe('createForBatch', () => {
  it('404s when the import batch does not exist', async () => {
    ImportBatch.findByPk.mockResolvedValue(null);
    await expect(correctionRequestService.createForBatch(999, 1, 'reason'))
      .rejects.toMatchObject({ statusCode: 404 });
  });

  it('creates a correction request tied to the batch and requesting admin', async () => {
    ImportBatch.findByPk.mockResolvedValue({ batch_id: 7 });
    CorrectionRequest.create.mockResolvedValue({ correction_id: 1 });

    const result = await correctionRequestService.createForBatch(7, 42, 'Wrong intake code');

    expect(CorrectionRequest.create).toHaveBeenCalledWith({
      batch_id: 7,
      requested_by: 42,
      justification: 'Wrong intake code',
    });
    expect(result).toEqual({ correction_id: 1 });
  });

  it('stores null justification when none is given', async () => {
    ImportBatch.findByPk.mockResolvedValue({ batch_id: 7 });
    await correctionRequestService.createForBatch(7, 42);

    expect(CorrectionRequest.create).toHaveBeenCalledWith(expect.objectContaining({ justification: null }));
  });
});

describe('listForBatch', () => {
  it('lists correction requests for a batch, newest first', async () => {
    const requests = [{ correction_id: 2 }, { correction_id: 1 }];
    CorrectionRequest.findAll.mockResolvedValue(requests);

    const result = await correctionRequestService.listForBatch(7);

    expect(CorrectionRequest.findAll).toHaveBeenCalledWith({
      where: { batch_id: 7 },
      order: [['requested_at', 'DESC']],
    });
    expect(result).toBe(requests);
  });
});

describe('decide', () => {
  it('404s when the correction request does not exist', async () => {
    CorrectionRequest.findByPk.mockResolvedValue(null);
    await expect(correctionRequestService.decide(999, 'Approved')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('updates the status and returns the record', async () => {
    const correction = { correction_id: 1, update: jest.fn().mockResolvedValue(undefined) };
    CorrectionRequest.findByPk.mockResolvedValue(correction);

    const result = await correctionRequestService.decide(1, 'Completed');

    expect(correction.update).toHaveBeenCalledWith({ status: 'Completed' });
    expect(result).toBe(correction);
  });
});
