import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import { Appointment } from "../models/appointmentSchema.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";
import { logAdminAction } from "../utils/audit.js";

export const patientRegister = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    aadhar,
    dob,
    role,
  } = req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !gender ||
    !aadhar ||
    !dob ||
    !role
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorHandler("User already registered with this email!", 400));
  }

  user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    dob,
    aadhar,
    role,
  });
  try {
    if (typeof user.generateJsonWebToken !== 'function') {
      console.error('User object missing generateJsonWebToken method during register', { userId: user._id });
      return next(new ErrorHandler('Internal server error during registration', 500));
    }
    generateToken(user, "User Registered", 200, res);
  } catch (err) {
    console.error('Registration error:', err);
    return next(new ErrorHandler('Internal server error during registration', 500));
  }
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please provide email and password!", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password!", 400));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email or Password!", 400));
  }

  // If role provided, ensure it matches user's role
  if (role && role !== user.role) {
    return next(new ErrorHandler("User with this role not found!", 400));
  }

  try {
    // ensure token generation method exists
    if (typeof user.generateJsonWebToken !== 'function') {
      console.error('User object missing generateJsonWebToken method', { userId: user._id });
      return next(new ErrorHandler('Internal server error during login', 500));
    }
    generateToken(user, "User Login Successfully", 200, res);
  } catch (err) {
    console.error('Login error:', err);
    return next(new ErrorHandler('Internal server error during login', 500));
  }
});

export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, gender, aadhar, dob } =
    req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !gender ||
    !aadhar ||
    !dob
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const isRegisterd = await User.findOne({ email });
  if (isRegisterd) {
    return next(
      new ErrorHandler(
        `${isRegisterd.role} with this email already exists!`,
        400
      )
    );
  }

  const maxAdmins = parseInt(process.env.MAX_ADMINS || '10', 10);
  const adminCount = await User.countDocuments({ role: 'Admin' });
  if (adminCount >= maxAdmins) {
    return next(new ErrorHandler(`Admin limit reached (${maxAdmins})`, 400));
  }

  const admin = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    aadhar,
    dob,
    role: "Admin",
  });

  // log admin creation
  try {
    const actorId = req.user?._id || null;
    if (actorId) await logAdminAction({ adminId: actorId, action: 'create_admin', targetType: 'User', targetId: admin._id, details: { email } });
  } catch (err) {
    console.error('Audit log failed', err);
  }

  res.status(200).json({
    success: true,
    message: "New Admin Registered!",
    adminId: admin._id
  });
});

export const initAdmin = catchAsyncErrors(async (req, res, next) => {
  // Bootstrap route to create first admin when no admins exist. Requires ADMIN_CREATION_KEY env var in body.
  const { firstName, lastName, email, phone, password, gender, aadhar, dob, seedKey } = req.body;
  if (!firstName || !lastName || !email || !phone || !password || !gender || !aadhar || !dob || !seedKey) {
    return next(new ErrorHandler('Please provide full details and seedKey', 400));
  }
  const existingAdmins = await User.countDocuments({ role: 'Admin' });
  if (existingAdmins > 0) {
    return next(new ErrorHandler('Initial admin already created', 400));
  }
  if (seedKey !== process.env.ADMIN_CREATION_KEY) {
    return next(new ErrorHandler('Invalid admin creation key', 401));
  }
  const admin = await User.create({ firstName, lastName, email, phone, password, gender, aadhar, dob, role: 'Admin' });
  res.status(200).json({ success: true, message: 'Initial admin created', adminId: admin._id });
});

export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
  const doctors = await User.find({ role: "Doctor" });
  res.status(200).json({
    success: true,
    doctors,
  });
});

export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("adminToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
      path: '/',
      sameSite: process.env.COOKIE_SAME_SITE || 'lax',
    })
    .json({
      success: true,
      message: "Admin Logged Out Successfully!",
    });
});

export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("patientToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
      path: '/',
      sameSite: process.env.COOKIE_SAME_SITE || 'lax',
    })
    .json({
      success: true,
      message: "Patient Logged Out Successfully!",
    });
});

export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Doctor avatar required!", 400));
  }
  const { doctrAvatar } = req.files;

  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(doctrAvatar.mimetype)) {
    return next(new ErrorHandler("File format not supported!", 400));
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    aadhar,
    dob,
    doctrDptmnt,
  } = req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !gender ||
    !aadhar ||
    !dob ||
    !doctrDptmnt
  ) {
    return next(new ErrorHandler("Please provide full details", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(
      new ErrorHandler(
        `${isRegistered.role} already registered with this email!`,
        400
      )
    );
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(
    doctrAvatar.tempFilePath
  );
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse.error || "Unknown Cloudinary Error"
    );
  }

  const doctor = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    aadhar,
    dob,
    role: "Doctor",
    doctrDptmnt,
    doctrAvatar: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });
  // audit log for doctor creation
  try {
    const adminId = req.user?._id;
    if (adminId) await logAdminAction({ adminId, action: 'create_doctor', targetType: 'User', targetId: doctor._id, details: { email } });
  } catch (e) { console.error('Audit log failed', e); }
  res.status(200).json({
    success: true,
    message: "New Doctor Registered!",
    doctor,
  });
});

// Development-only bootstrap: create sample admin, doctor, patient and appointments
export const devBootstrap = catchAsyncErrors(async (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return next(new ErrorHandler('Not allowed in production', 403));
  }

  const created = {
    admins: [],
    doctors: [],
    patients: [],
    appointments: []
  };

  // Helper to create user if not exists
  async function ensureUser({ firstName, lastName, email, phone, password, gender, aadhar, dob, role, doctrDptmnt }) {
    let u = await User.findOne({ email });
    if (u) return u;
    const payload = { firstName, lastName, email, phone, password, gender, aadhar, dob, role };
    if (role === 'Doctor') payload.doctrDptmnt = doctrDptmnt || 'General';
    u = await User.create(payload);
    return u;
  }

  // create admin
  const admin = await ensureUser({ firstName: 'Dev', lastName: 'Admin', email: 'dev.admin@example.com', phone: '0000000000', password: 'password123', gender: 'Other', aadhar: '123456789000', dob: new Date(1990, 0, 1), role: 'Admin' });
  created.admins.push(admin._id);

  // create doctor
  const doctor = await ensureUser({ firstName: 'Jane', lastName: 'Doe', email: 'dr.jane@example.com', phone: '1111111111', password: 'password123', gender: 'Female', aadhar: '123456789001', dob: new Date(1985, 5, 5), role: 'Doctor', doctrDptmnt: 'Cardiology' });
  created.doctors.push(doctor._id);

  // create patient
  const patient = await ensureUser({ firstName: 'John', lastName: 'Patient', email: 'john.patient@example.com', phone: '2222222222', password: 'password123', gender: 'Male', aadhar: '123456789002', dob: new Date(1995, 3, 3), role: 'Patient' });
  created.patients.push(patient._id);

  // create an appointment linking them
  const apptExists = await Appointment.findOne({ doctorId: doctor._id, patientId: patient._id });
  if (!apptExists) {
    const appt = await Appointment.create({
      patient: { firstName: patient.firstName, lastName: patient.lastName, email: patient.email, phone: patient.phone, dob: patient.dob, gender: patient.gender, aadhar: patient.aadhar },
      appointment: { date: new Date().toISOString().split('T')[0], time: '10:00', department: 'Cardiology', symptoms: 'Routine check', insuranceProvider: '', emergencyContact: '' },
      doctorId: doctor._id,
      doctor: { firstName: doctor.firstName, lastName: doctor.lastName, specialization: doctor.doctrDptmnt || 'General' },
      patientId: patient._id,
      status: 'Pending'
    });
    created.appointments.push(appt._id);
  }

  res.status(200).json({ success: true, message: 'Dev bootstrap completed', created });
});
