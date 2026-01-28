import express from "express";
import { config } from "dotenv";
import cors from "cors"
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { dbConnection } from "./database/dbConnection.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import userRouter from "./router/userRouterNew.js"
import messageRouter from "./router/messageRouter.js"
import appointmentRouter from "./router/appointmentRouter.js"
import notificationRouter from "./router/notificationRouter.js"
import auditRouter from './router/auditRouter.js'
import aiRouter from './router/aiRouter.js'

const app = express();

// Load .env (fallback to default .env in project root)
config();

// Enhanced CORS configuration with better debugging
const allowedOrigins = [
    process.env.FRONTEND_PATIENT,
    process.env.FRONTEND_ADMIN,
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:8080',
    'http://localhost:5000' // Add backend itself
].filter(Boolean);

console.log('Allowed CORS origins:', allowedOrigins);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if origin is in allowed list
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cookie']
}));

// Handle pre-flight requests explicitly
app.options('*', cors());

// Middleware setup
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
}));

// Debug middleware for all requests
if (process.env.DEBUG_API === 'true') {
    app.use((req, res, next) => {
        console.log(`\n=== [${new Date().toISOString()}] ${req.method} ${req.originalUrl} ===`);
        console.log('Cookies:', req.cookies || {});
        console.log('Body:', req.body ? JSON.stringify(req.body).substring(0, 500) : 'Empty');
        next();
    });
}

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'Hospital Management API',
        version: '1.0.0'
    });
});

// API status endpoint
app.get('/api/status', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running',
        endpoints: {
            v1: '/api/v1',
            appointments: '/api/v1/appointment',
            users: '/api/v1/user',
            messages: '/api/v1/message',
            notifications: '/api/v1/notification',
            audit: '/api/v1/audit'
        }
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is working',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development'
    });
});

// Register routers with proper error handling
console.log('\n=== Registering Routers ===');

// Define routers with proper error handling
const routers = [
    { path: '/api/v1/message', router: messageRouter, name: 'messageRouter' },
    { path: '/api/v1/user', router: userRouter, name: 'userRouter' },
    { path: '/api/v1/appointment', router: appointmentRouter, name: 'appointmentRouter' },
    { path: '/api/v1/notification', router: notificationRouter, name: 'notificationRouter' },
    { path: '/api/v1/audit', router: auditRouter, name: 'auditRouter' },
    { path: '/api/v1/ai', router: aiRouter, name: 'aiRouter' },
    // Compatibility route for admin frontend
    { path: '/api/appointments', router: appointmentRouter, name: 'compatibilityAppointmentRouter' }
];

routers.forEach(({ path, router, name }) => {
    try {
        app.use(path, router);
        console.log(`✓ ${name} mounted at ${path}`);
    } catch (error) {
        console.error(`✗ Failed to mount ${name}:`, error.message);
    }
});

// Special routes for checking endpoints
app.get('/api/v1/user/admin/check', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Admin check endpoint is accessible',
        timestamp: new Date().toISOString()
    });
});

// Test login endpoint
app.post('/api/v1/user/login/test', (req, res) => {
    console.log('Login test endpoint called');
    res.status(200).json({
        success: true,
        message: 'Login endpoint is accessible',
        receivedData: req.body
    });
});

// Start reminder scheduler (optional)
(async () => {
    try {
        const mod = await import('./utils/reminder.js');
        if (mod?.startReminderJob) {
            mod.startReminderJob();
            console.log('✓ Reminder scheduler started');
        }
    } catch (err) {
        console.warn('⚠ Reminder job not started:', err.message || err);
    }
})();

// Database connection
dbConnection();

// 404 handler for unmatched routes
app.all('*', (req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// Global error handler
app.use(errorMiddleware);

// Error logging
process.on('uncaughtException', (err) => {
    console.error('\n🚨 UNCAUGHT EXCEPTION 🚨');
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('\n🚨 UNHANDLED REJECTION 🚨');
    console.error('Promise:', promise);
    console.error('Reason:', reason);
});

export default app;