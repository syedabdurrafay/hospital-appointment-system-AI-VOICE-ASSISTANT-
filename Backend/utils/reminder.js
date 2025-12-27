import cron from 'node-cron';
import { Appointment } from '../models/appointmentSchema.js';
import { Notification } from '../models/notificationSchema.js';
import mongoose from 'mongoose';

// Run every hour
export const startReminderJob = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Find appointments scheduled between now and next 24 hours
      const appointments = await Appointment.find({
        'appointment.date': { $exists: true }
      });

      for (const appt of appointments) {
        const dateStr = appt.appointment?.date;
        const timeStr = appt.appointment?.time || '00:00';
        if (!dateStr) continue;
        const dt = new Date(`${dateStr}T${timeStr}`);
        if (dt > now && dt <= in24h) {
          // check for existing reminder
          const existing = await Notification.findOne({
            userId: appt.patientId,
            'data.appointmentId': appt._id,
            'data.type': 'reminder'
          });
          if (!existing) {
            await Notification.create({
              userId: appt.patientId,
              title: 'Appointment Reminder',
              body: `Reminder: you have an appointment on ${dateStr} at ${timeStr}`,
              data: { appointmentId: appt._id, type: 'reminder' }
            });
          }
        }
      }
    } catch (err) {
      console.error('Reminder job error', err);
    }
  });
};
