import mongoose from "mongoose"
import validator from "validator"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: [3, "First Name must contain atleast 3 characters!"]
    },
    lastName: {
        type: String,
        required: true,
        minLength: [2, "Last Name must contain atleast 2 characters!"]
    },
    email: {
        type: String,
        required: true,
        validate: [validator.isEmail, "Please provide a valid Email!"]
    },
    phone: {
        type: String,
        required: true,
        maxLength: [10, "Phone number must contain exact 10 digits!"],
        minLength: [10, "Phone number must contain exact 10 digits!"]
    },
    aadhar: {
        type: String,
        minLength: [12, "Aadhar number must contain exact 12 digits!"]
    },
    dob: {
        type: Date,
        required: [true, "Date of Birth is required!"]
    },
    gender: {
        type: String,
        required: true,
        enum: ["Male", "Female", "Other", "Prefer not to say", "Others"]
    },
    password: {
        type: String,
        required: true,
        minLength: [8, "Password must contain atleat 8 characters!"],
        select: false
    },
    role: {
        type: String,
        required: true,
        enum: ["Admin", "Patient", "Doctor"]
    },
    // For doctors
    specialization: {
        type: String,
        default: "General Physician"
    },
    doctrDptmnt: {
        type: String
    },
    // Doctor working hours (in 24-hour format)
    workingHours: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "17:00" }
    },
    // Days doctor is available (0=Sunday, 1=Monday, etc.)
    availableDays: {
        type: [Number],
        default: [1, 2, 3, 4, 5] // Monday to Friday by default
    },
    // Maximum appointments per day
    maxAppointmentsPerDay: {
        type: Number,
        default: 8
    },
    // Consultation duration in minutes
    consultationDuration: {
        type: Number,
        default: 30
    },
    // Doctor leave dates
    leaveDates: [{
        date: Date,
        reason: String
    }],
    // Doctor profile
    experience: {
        type: String,
        default: ""
    },
    qualification: {
        type: String,
        default: "MBBS"
    },
    bio: {
        type: String,
        default: ""
    },
    // Avatar
    doctrAvatar: {
        public_id: String,
        url: String
    },
    // Doctor status
    isActive: {
        type: Boolean,
        default: true
    }
})

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.generateJsonWebToken = function () {
    const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || 'secretkey';
    const expiresIn = process.env.JWT_EXPIRES || process.env.JWT_EXPIRES_IN || '7d';
    return jwt.sign({ id: this._id }, secret, {
        expiresIn,
    });
}

// Helper method to check if doctor is available on a specific date
userSchema.methods.isAvailableOnDate = function (date) {
    const day = new Date(date).getDay();
    return this.availableDays.includes(day);
}

export const User = mongoose.model("User", userSchema)