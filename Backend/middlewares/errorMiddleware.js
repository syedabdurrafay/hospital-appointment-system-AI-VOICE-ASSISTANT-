class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const errorMiddleware = (err, req, res, next) => {
    console.debug('ERROR MIDDLEWARE CAUGHT:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        code: err.code,
        path: err.path,
        value: err.value
    });

    err.message = err.message || 'Internal Server Error';
    err.statusCode = err.statusCode || 500;

    if (err.message === 'Not allowed by CORS') {
        err = new ErrorHandler('Not allowed by CORS origin policy', 403);
    }

    if (err.code === 11000) {
        const field = err.keyValue ? Object.keys(err.keyValue) : 'Field';
        const message = `Duplicate ${field} Entered`
        err = new ErrorHandler(message, 400)
    }
    if (err.name === "JsonWebTokenError") {
        const message = "Json Web Token is invalid, Try Again!";
        console.error('JWT Error:', err);
        err = new ErrorHandler(message, 401)
    }
    if (err.name === "TokenExpiredError") {
        const message = "Json Web Token is Expired, Try Again!";
        console.error('JWT Expired:', err);
        err = new ErrorHandler(message, 401)
    }
    if (err.name === "CastError") {
        // Handle MongoDB CastErrors (e.g. invalid ObjectId)
        const message = `Invalid resource found: ${err.path}. Value: ${err.value}`;
        console.error('Cast Error Details:', err);
        err = new ErrorHandler(message, 400)
    }

    const errorMessage = err.errors ? Object.values(err.errors).map((error) => error.message).join(" ") : err.message;

    return res.status(err.statusCode).json({
        success: false,
        message: errorMessage
    })
}


export default ErrorHandler;