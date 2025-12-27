export const generateToken = (user, message, statusCode, res) => {
    const token = user.generateJsonWebToken();
    const cookieName = user.role === 'Admin' ? 'adminToken' : 'patientToken';
    const cookieExpireDays = parseInt(process.env.COOKIE_EXPIRE || '7', 10);
    // Ensure cookie is set for root path so it will be sent on other API endpoints
    const cookieOptions = {
        expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
        httpOnly: true,
        path: '/',
        sameSite: process.env.COOKIE_SAME_SITE || 'lax',
        secure: process.env.COOKIE_SECURE === 'true'
    };

    res
        .status(statusCode)
        .cookie(cookieName, token, cookieOptions)
        .json({
            success: true,
            message,
            user,
            token,
        });
};