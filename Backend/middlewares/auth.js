import { User } from "../models/userSchema.js";
import ErrorHandler from "./errorMiddleware.js";
import jwt from "jsonwebtoken";

// Common async error handler
export const catchAsyncErrors = (passedFunction) => (req, res, next) => {
    Promise.resolve(passedFunction(req, res, next)).catch(next);
};

// Admin authentication middleware
export const isAdminAuthenticated = catchAsyncErrors(async (req, res, next) => {
    // Accept token from cookie or Authorization header (Bearer)
    let token = req.cookies.adminToken || req.cookies.token;
    const authHeader = req.headers?.authorization;
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token && bearerToken) token = bearerToken;

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
    req.user = await User.findById(decoded.id);
    console.debug('Auth middleware: authenticated user', { userId: decoded.id, role: req.user?.role });

    if (!req.user || req.user.role !== "Admin") {
        return next(new ErrorHandler("Unauthorized access", 403));
    }

    next();
});

// Patient authentication middleware - ADD THIS
export const isPatientAuthenticated = catchAsyncErrors(async (req, res, next) => {
    let token = req.cookies.token || req.cookies.patientToken;
    const authHeader = req.headers?.authorization;
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token && bearerToken) token = bearerToken;

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