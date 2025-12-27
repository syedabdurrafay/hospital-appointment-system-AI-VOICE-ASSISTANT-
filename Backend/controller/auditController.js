import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import { Audit } from '../models/auditSchema.js';

export const getAllAudits = catchAsyncErrors(async (req, res, next) => {
  const audits = await Audit.find().sort({ createdAt: -1 }).populate('adminId', 'firstName lastName email');
  res.status(200).json({ success: true, audits });
});

export const getMyAudits = catchAsyncErrors(async (req, res, next) => {
  const adminId = req.user?._id;
  const audits = await Audit.find({ adminId }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, audits });
});
