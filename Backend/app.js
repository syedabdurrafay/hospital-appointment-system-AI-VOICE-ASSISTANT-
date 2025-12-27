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

const app = express();

// Load .env (fallback to default .env in project root)
config();

// Enhanced CORS configuration
const allowedOrigins = [
    process.env.FRONTEND_PATIENT,
    process.env.FRONTEND_ADMIN,
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:8080'
].filter(Boolean); // Remove undefined values

console.log('Allowed CORS origins:', allowedOrigins);

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin && process.env.NODE_ENV === 'development') {
                return callback(null, true);
            }
            
            // Check if origin is in allowed list
            if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
                callback(null, true);
            } else {
                console.log('CORS blocked origin:', origin);
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
    })
);

// Handle pre-flight requests
app.options('*', cors());

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}))

// Debug middleware for all requests
if (process.env.DEBUG_API === 'true') {
    app.use((req, res, next) => {
        console.log(`\n=== [${new Date().toISOString()}] ${req.method} ${req.originalUrl} ===`);
        console.log('Headers:', JSON.stringify(req.headers, null, 2));
        console.log('Cookies:', req.cookies || {});
        console.log('Body:', req.body ? JSON.stringify(req.body).substring(0, 500) : 'Empty');
        console.log('Query:', req.query);
        console.log('Params:', req.params);
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

// Register routers with debug logging
console.log('Registering routers...');

try {
    app.use('/api/v1/message', messageRouter);
    console.log('✓ Message router mounted at /api/v1/message');
} catch (e) {
    console.error('✗ Failed to mount messageRouter:', e.message);
}

try {
    app.use('/api/v1/user', userRouter);
    console.log('✓ User router mounted at /api/v1/user');
} catch (e) {
    console.error('✗ Failed to mount userRouter:', e.message);
}

try {
    app.use('/api/v1/appointment', appointmentRouter);
    console.log('✓ Appointment router mounted at /api/v1/appointment');
} catch (e) {
    console.error('✗ Failed to mount appointmentRouter:', e.message);
}

try {
    app.use('/api/v1/notification', notificationRouter);
    console.log('✓ Notification router mounted at /api/v1/notification');
} catch (e) {
    console.error('✗ Failed to mount notificationRouter:', e.message);
}

try {
    app.use('/api/v1/audit', auditRouter);
    console.log('✓ Audit router mounted at /api/v1/audit');
} catch (e) {
    console.error('✗ Failed to mount auditRouter:', e.message);
}

// Compatibility route for admin frontend (using /api/appointments)
try {
    app.use('/api/appointments', appointmentRouter);
    console.log('✓ Compatibility appointment router mounted at /api/appointments');
} catch (e) {
    console.error('✗ Failed to mount compatibility appointmentRouter:', e.message);
}

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

// Log uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('\n🚨 UNCAUGHT EXCEPTION 🚨');
    console.error('Name:', err.name);
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    console.error('Timestamp:', new Date().toISOString());
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('\n🚨 UNHANDLED REJECTION 🚨');
    console.error('Promise:', promise);
    console.error('Reason:', reason);
    console.error('Timestamp:', new Date().toISOString());
});

// Server startup logging
const startServer = () => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log('\n' + '='.repeat(50));
        console.log('🚀 Hospital Management System Backend');
        console.log('='.repeat(50));
        console.log(`✅ Server running on port: ${PORT}`);
        console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`✅ Database: ${process.env.MONGO_URI ? 'Connected' : 'Not configured'}`);
        console.log(`✅ CORS Origins: ${allowedOrigins.join(', ') || 'All origins (development)'}`);
        console.log(`✅ Debug Mode: ${process.env.DEBUG_API === 'true' ? 'Enabled' : 'Disabled'}`);
        console.log('='.repeat(50));
        console.log('\nAvailable Routes:');
        console.log('- GET  /health                    Health check');
        console.log('- GET  /api/status               API status');
        console.log('- POST /api/v1/appointment/post  Create appointment');
        console.log('- GET  /api/v1/appointment/getall Get all appointments (Admin)');
        console.log('- GET  /api/appointments/getall   Compatibility route');
        console.log('- PUT  /api/v1/appointment/update/:id Update appointment');
        console.log('- DELETE /api/v1/appointment/delete/:id Delete appointment');
        console.log('='.repeat(50) + '\n');
    });
};

// Start the server
startServer();

export default app;