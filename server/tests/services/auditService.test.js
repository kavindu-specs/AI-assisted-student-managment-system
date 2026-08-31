jest.mock('../../src/models', () => ({
  AuditLog: { create: jest.fn() },
}));

const { AuditLog } = require('../../src/models');
const auditService = require('../../src/services/auditService');

describe('auditService.record', () => {
  it('maps the camelCase call arguments onto the AuditLog schema columns', async () => {
    AuditLog.create.mockResolvedValue({ audit_id: 1 });

    await auditService.record({
      actorId: 42,
      action: 'APPROVE',
      entityName: 'student',
      entityId: 5,
      description: 'Approved AGRI-2026-0005',
      ipAddress: '127.0.0.1',
    });

    expect(AuditLog.create).toHaveBeenCalledWith({
      actor_id: 42,
      action: 'APPROVE',
      entity_name: 'student',
      entity_id: 5,
      description: 'Approved AGRI-2026-0005',
      ip_address: '127.0.0.1',
    });
  });

  it('defaults description and ip_address to null when not provided', async () => {
    await auditService.record({
      actorId: 1, action: 'REJECT', entityName: 'student', entityId: 2,
    });

    expect(AuditLog.create).toHaveBeenCalledWith(expect.objectContaining({ description: null, ip_address: null }));
  });
});
