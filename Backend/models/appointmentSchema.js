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
    cancelledAt: { type: Date }
});

export const Appointment = mongoose.model("Appointment", appointmentSchema);
