const { AuditLog } = require('../models');

async function record({ userId, studentId = null, entityType, entityId, action, oldValue = null, newValue = null, reason = null, ipAddress = null }) {
  return AuditLog.create({
    user_id: userId,
    student_id: studentId,
    entity_type: entityType,
    entity_id: String(entityId),
    action,
    old_value: oldValue,
    new_value: newValue,
    reason,
    ip_address: ipAddress,
  });
}

module.exports = { record };
