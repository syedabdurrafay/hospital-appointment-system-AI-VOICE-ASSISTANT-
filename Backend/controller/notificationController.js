import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { Notification } from "../models/notificationSchema.js";

export const createNotification = catchAsyncErrors(async (req, res, next) => {
  const { userId, title, body, data } = req.body;
  if (!userId || !title || !body) return next(new ErrorHandler('Missing fields for notification', 400));
  const n = await Notification.create({ userId, title, body, data });
  res.status(200).json({ success: true, notification: n });
});

export const getUserNotifications = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;
  const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, notifications });
});

export const markAsRead = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const n = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
  if (!n) return next(new ErrorHandler('Notification not found', 404));
  res.status(200).json({ success: true, notification: n });
});

export const getAllNotifications = catchAsyncErrors(async (req, res, next) => {
  // Admin: return all notifications
  const notifications = await Notification.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, notifications });
});
