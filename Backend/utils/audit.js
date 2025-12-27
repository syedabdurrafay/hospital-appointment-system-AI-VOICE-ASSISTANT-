import { Audit } from '../models/auditSchema.js';

export const logAdminAction = async ({ adminId, action, targetType = '', targetId = null, details = {} }) => {
  try {
    await Audit.create({ adminId, action, targetType, targetId, details });
  } catch (err) {
    console.error('Failed to log admin action', err);
  }
};
