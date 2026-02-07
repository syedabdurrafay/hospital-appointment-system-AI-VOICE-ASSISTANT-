import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import cloudinary from "cloudinary";

export const patientRegister = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, dob, gender, password, aadhar } = req.body;

  if (!firstName || !lastName || !email || !phone || !dob || !gender || !password || !aadhar) {
    return next(new ErrorHandler("Please fill full form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("User already registered!", 400));
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    dob,
    gender,
    password,
    aadhar,
    role: "Patient",
  });

  res.status(200).json({
    success: true,
    message: "Patient registered successfully!",
    user,
  });
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;
  console.log(`Login attempt: email=${email}, role=${role}`);

  if (!email || !password || !role) {
    return next(new ErrorHandler("Please provide email, password and role", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 400));
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid email or password", 400));
  }

  if (role !== user.role) {
    return next(new ErrorHandler(`User with provided role (${role}) not found`, 400));
  }

  const token = user.generateJsonWebToken();

  // Set cookie based on role
  const cookieName = role === "Admin" ? "adminToken" : "token";
  res
    .status(200)
    .cookie(cookieName, token, {
      expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    })
    .json({
      success: true,
      message: `Logged in as ${role}`,
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        specialization: user.specialization,
        experience: user.experience,
        qualification: user.qualification,
      },
    });
});

export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  console.log('POST /admin/addnew called');
  console.log('Body:', req.body);

  const { firstName, lastName, email, phone, dob, aadhar, gender, password } = req.body;

  if (!firstName || !lastName || !email || !phone || !dob || !aadhar || !gender || !password) {
    return next(new ErrorHandler("Please fill all required fields", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler(`${isRegistered.role} with this email already registered!`, 400));
  }

  const admin = await User.create({
    firstName,
    lastName,
    email,
    phone,
    dob,
    gender,
    aadhar,
    password,
    role: "Admin",
  });

  res.status(200).json({
    success: true,
    message: "New admin registered successfully!",
    admin,
  });
});

export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
  console.log('POST /doctor/addnew called');
  console.log('Body:', req.body);
  console.log('Files:', req.files);

  const {
    firstName,
    lastName,
    email,
    phone,
    dob,
    gender,
    password,
    specialization,
    experience,
    qualification,
  } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !email || !phone || !password || !gender) {
    return next(new ErrorHandler('Please fill in all required fields', 400));
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorHandler('User with this email already exists', 400));
    }

    // Prepare doctor data
    const doctorData = {
      firstName,
      lastName,
      email,
      phone,
      dob,
      gender,
      password,
      role: 'Doctor',
      specialization: specialization || 'General Physician',
      experience: experience || '0',
      qualification: qualification || 'MBBS',
      doctDptmnt: specialization || 'General Physician',
      workingHours: { start: '09:00', end: '17:00' },
      availableDays: [1, 2, 3, 4, 5], // Monday to Friday
      maxAppointmentsPerDay: 8,
      consultationDuration: 30,
      isActive: true,
    };

    // Handle avatar upload if present
    if (req.files && req.files.doctrAvatar) {
      const result = await cloudinary.v2.uploader.upload(
        req.files.doctrAvatar.tempFilePath,
        {
          folder: "doctors",
          width: 150,
          crop: "scale",
        }
      );

      doctorData.doctrAvatar = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    // Create doctor
    const doctor = await User.create(doctorData);

    res.status(201).json({
      success: true,
      message: 'Doctor registered successfully',
      doctor: {
        _id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        specialization: doctor.specialization,
        qualification: doctor.qualification,
        experience: doctor.experience,
      },
    });

  } catch (error) {
    console.error('Error registering doctor:', error);

    // Handle Mongoose Validation Errors
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ');
      return next(new ErrorHandler(message, 400));
    }

    // Handle Duplicate Key Error (e.g., email already exists)
    if (error.code === 11000) {
      return next(new ErrorHandler(`Duplicate field value entered: ${Object.keys(error.keyValue)}`, 400));
    }

    return next(new ErrorHandler(`Failed to register doctor: ${error.message}`, 500));
  }
});

export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
  console.log('GET /user/doctors called');

  try {
    const doctors = await User.find({ role: 'Doctor' })
      .select('-password') // Exclude password
      .sort({ firstName: 1 });

    console.log(`Found ${doctors.length} doctors`);

    // Transform doctors data for frontend
    const transformedDoctors = doctors.map((doctor) => ({
      _id: doctor._id,
      id: doctor._id.toString(),
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      phone: doctor.phone,
      specialization: doctor.specialization || doctor.doctrDptmnt || 'General Physician',
      experience: doctor.experience || '5',
      qualification: doctor.qualification || 'MBBS',
      workingHours: doctor.workingHours || { start: '09:00', end: '17:00' },
      consultationDuration: doctor.consultationDuration || 30,
      availableDays: doctor.availableDays || [1, 2, 3, 4, 5],
      maxAppointmentsPerDay: doctor.maxAppointmentsPerDay || 8,
      description: doctor.bio || `Experienced ${doctor.specialization || 'doctor'} with ${doctor.experience || '5'} years of experience.`,
      rating: '4.8', // Default rating
      availability: 'Mon-Fri, 9AM-5PM', // Default availability string
      isActive: doctor.isActive || true,
    }));

    res.status(200).json({
      success: true,
      doctors: transformedDoctors,
      count: transformedDoctors.length,
      message: `Found ${transformedDoctors.length} doctors`,
    });

  } catch (error) {
    console.error('Error fetching doctors:', error);
    return next(new ErrorHandler('Failed to fetch doctors', 500));
  }
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
    .clearCookie("adminToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    })
    .json({
      success: true,
      message: "Admin logged out successfully",
    });
});

export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    })
    .json({
      success: true,
      message: "Patient logged out successfully",
    });
});

export const initAdmin = catchAsyncErrors(async (req, res, next) => {
  const { seedKey, ...adminData } = req.body;

  if (!seedKey || seedKey !== process.env.ADMIN_CREATION_KEY) {
    return next(new ErrorHandler("Invalid or missing seed key", 403));
  }

  if (!adminData.firstName || !adminData.lastName || !adminData.email || !adminData.password) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  // Check if any admin already exists
  const existingAdmin = await User.findOne({ role: "Admin" });
  if (existingAdmin) {
    return next(
      new ErrorHandler("Admin already exists. Use /admin/addnew with authentication.", 400)
    );
  }

  adminData.role = "Admin";
  const admin = await User.create(adminData);

  const token = admin.generateJsonWebToken();

  res
    .status(201)
    .cookie("adminToken", token, {
      expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    })
    .json({
      success: true,
      message: "First admin created successfully",
      token,
      admin: {
        _id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
      },
    });
});

export const checkInitialAdmin = catchAsyncErrors(async (req, res, next) => {
  const adminExists = await User.exists({ role: "Admin" });
  res.status(200).json({
    success: true,
    adminExists: !!adminExists,
    message: adminExists ? "Admin already exists" : "No admin found",
  });
});

export const devBootstrap = catchAsyncErrors(async (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    return next(new ErrorHandler("This endpoint is only available in development", 403));
  }

  const { clear, seedKey } = req.body;
  if (seedKey !== process.env.DEV_SEED_KEY) {
    return next(new ErrorHandler("Invalid dev seed key", 403));
  }

  if (clear) {
    await User.deleteMany({});
    console.log("Cleared all users");
  }

  // Create sample admin
  const admin = await User.create({
    firstName: "System",
    lastName: "Admin",
    email: "admin@healthcare.com",
    phone: "9876543210",
    dob: new Date("1980-01-01"),
    aadhar: "123456789012",
    gender: "Male",
    password: "password123",
    role: "Admin",
  });

  // Create sample doctors
  const doctors = await User.create([
    {
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@hospital.com",
      phone: "9876543211",
      dob: new Date("1975-05-15"),
      aadhar: "234567890123",
      gender: "Male",
      password: "doctor123",
      role: "Doctor",
      specialization: "General Physician",
      experience: "15",
      qualification: "MD, MBBS",
      doctDptmnt: "General Medicine",
      workingHours: { start: "09:00", end: "17:00" },
      availableDays: [1, 2, 3, 4, 5],
      maxAppointmentsPerDay: 8,
      consultationDuration: 30,
      isActive: true,
    },
    {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@hospital.com",
      phone: "9876543212",
      dob: new Date("1980-08-20"),
      aadhar: "345678901234",
      gender: "Female",
      password: "doctor123",
      role: "Doctor",
      specialization: "General Physician",
      experience: "12",
      qualification: "MD, MBBS",
      doctDptmnt: "General Medicine",
      workingHours: { start: "10:00", end: "18:00" },
      availableDays: [1, 2, 3, 4, 5, 6],
      maxAppointmentsPerDay: 8,
      consultationDuration: 30,
      isActive: true,
    },
  ]);

  // Create sample patient
  const patient = await User.create({
    firstName: "Michael",
    lastName: "Brown",
    email: "michael.brown@example.com",
    phone: "9876543213",
    dob: new Date("1990-03-10"),
    aadhar: "456789012345",
    gender: "Male",
    password: "patient123",
    role: "Patient",
  });

  res.status(201).json({
    success: true,
    message: "Development data seeded successfully",
    counts: {
      admin: 1,
      doctors: 2,
      patient: 1,
    },
    users: {
      admin: {
        email: admin.email,
        password: "password123",
      },
      doctors: doctors.map((d) => ({
        email: d.email,
        password: "doctor123",
        specialization: d.specialization,
      })),
      patient: {
        email: patient.email,
        password: "patient123",
      },
    },
  });
});