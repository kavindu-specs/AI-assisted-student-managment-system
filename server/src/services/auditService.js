const { AuditLog } = require('../models');

async function record({
  actorId, action, entityName, entityId, description = null, ipAddress = null,
}) {
  return AuditLog.create({
    actor_id: actorId,
    action,
    entity_name: entityName,
    entity_id: entityId,
    description,
    ip_address: ipAddress,
  });
}

module.exports = { record };
