import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  targetType: { type: String },
  targetId: { type: mongoose.Schema.ObjectId },
  details: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

export const Audit = mongoose.model('Audit', auditSchema);
