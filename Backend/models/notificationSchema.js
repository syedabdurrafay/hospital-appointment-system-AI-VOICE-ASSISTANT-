import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'User'
  },
  title: { type: String, required: true },
  body: { type: String, required: true },
  data: { type: Object },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const Notification = mongoose.model('Notification', notificationSchema);
