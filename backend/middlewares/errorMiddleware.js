// Error handling middleware

const errorMiddleware = (err, req, res, next) => {
    const statusCode = err.statusCode || 500; // Default to 500 if no status code is provided
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Show stack trace only in development
    });
};

export default errorMiddleware;