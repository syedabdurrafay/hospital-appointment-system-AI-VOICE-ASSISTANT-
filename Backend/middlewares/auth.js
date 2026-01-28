import { User } from "../models/userSchema.js";
import ErrorHandler from "./errorMiddleware.js";
import jwt from "jsonwebtoken";

// Common async error handler
export const catchAsyncErrors = (passedFunction) => (req, res, next) => {
    Promise.resolve(passedFunction(req, res, next)).catch(next);
};

// Admin authentication middleware
export const isAdminAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const authHeader = req.headers?.authorization;
    let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        token = req.cookies.adminToken || req.cookies.token;
    }

    if (!token) {
        return next(new ErrorHandler("Admin not authenticated", 401));
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        console.warn('Auth middleware: token verify failed', { err: e && e.message, tokenPresent: !!token });
        return next(new ErrorHandler('Invalid or expired token', 401));
    }
    try {
        req.user = await User.findById(decoded.id);
    } catch (dbError) {
        return next(new ErrorHandler('Invalid user identifier in token', 401));
    }
    console.debug('Auth middleware: authenticated user', { userId: decoded.id, role: req.user?.role });

    if (!req.user || req.user.role !== "Admin") {
        return next(new ErrorHandler("Admin access only", 403));
    }

    next();
});

// Patient authentication middleware
export const isPatientAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const authHeader = req.headers?.authorization;
    let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        token = req.cookies.token || req.cookies.patientToken;
    }

    if (!token) {
        return next(new ErrorHandler("Patient not authenticated", 401));
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return next(new ErrorHandler('Invalid or expired token', 401));
    }
    req.user = await User.findById(decoded.id);

    if (!req.user || req.user.role !== "Patient") {
        return next(new ErrorHandler("Patient access only", 403));
    }

    next();
});

// Doctor authentication middleware
export const isDoctorAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const authHeader = req.headers?.authorization;
    let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        token = req.cookies.doctorToken || req.cookies.token;
    }

    if (!token) {
        return next(new ErrorHandler("Doctor not authenticated", 401));
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return next(new ErrorHandler('Invalid or expired token', 401));
    }
    try {
        req.user = await User.findById(decoded.id);
    } catch (dbError) {
        return next(new ErrorHandler('Invalid user identifier in token', 401));
    }

    if (!req.user || req.user.role !== "Doctor") {
        return next(new ErrorHandler("Doctor access only", 403));
    }

    next();
});

// Admin or Doctor authentication middleware
export const isAdminOrDoctorAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const authHeader = req.headers?.authorization;
    let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        token = req.cookies.adminToken || req.cookies.doctorToken || req.cookies.token;
    }

    if (!token) {
        return next(new ErrorHandler("User not authenticated", 401));
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return next(new ErrorHandler('Invalid or expired token', 401));
    }
    try {
        req.user = await User.findById(decoded.id);
    } catch (dbError) {
        console.error('Auth middleware: DB Error finding user', dbError);
        return next(new ErrorHandler('Invalid user identifier in token', 401));
    }

    if (!req.user || (req.user.role !== "Admin" && req.user.role !== "Doctor")) {
        return next(new ErrorHandler("Unauthorized access", 403));
    }

    next();
});