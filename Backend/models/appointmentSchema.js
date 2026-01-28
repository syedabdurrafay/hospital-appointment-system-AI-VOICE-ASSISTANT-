import mongoose, { Mongoose } from "mongoose";
import validator from "validator";

const appointmentSchema = new mongoose.Schema({
    // store submitted patient snapshot
    patient: {
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        dob: Date,
        gender: String,
        aadhar: String
    },
    // appointment details
    appointment: {
        date: String,
        time: String,
        department: String,
        symptoms: String,
        insuranceProvider: String,
        emergencyContact: String,
        hasVisited: { type: Boolean, default: false }
    },
    doctorId: { type: mongoose.Schema.ObjectId, ref: 'User' },
    doctor: {
        firstName: String,
        lastName: String,
        specialization: String
    },
    patientId: { type: mongoose.Schema.ObjectId, ref: 'User' },
    status: { type: String, enum: ["Pending", "Accepted", "Rejected", "Cancelled", "Completed"], default: "Pending" },
    createdAt: { type: Date, default: Date.now },
    confirmedAt: { type: Date },
    cancelledAt: { type: Date },
    // Add slot duration for better management
    duration: { type: Number, default: 30 }, // in minutes
    // Add appointment type for future extensions
    appointmentType: { type: String, default: 'Regular' }
});

// Add indexes for faster queries
appointmentSchema.index({ doctorId: 1, 'appointment.date': 1, 'appointment.time': 1 });
appointmentSchema.index({ patientId: 1, createdAt: -1 });
appointmentSchema.index({ status: 1 });

export const Appointment = mongoose.model("Appointment", appointmentSchema);