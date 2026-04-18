/**
 * Global Error Handler Middleware
 * Catches all errors and returns consistent JSON responses
 */

const errorHandler = (err, req, res, next) => {
  // Use status code from response if set, otherwise default to 500
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // ── Handle specific MongoDB/Mongoose errors ──────────────────────────────
  
  // CastError: Invalid MongoDB ObjectId (e.g., /api/products/invalid-id)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found - invalid ID format';
  }

  // ValidationError: Mongoose schema validation failed
  if (err.name === 'ValidationError') {
    statusCode = 400;
    // Combine all validation error messages into one string
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Duplicate key error (e.g., duplicate email)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired - please login again';
  }

  // ── Send error response ───────────────────────────────────────────────────
  res.status(statusCode).json({
    success: false,
    message,
    // Show stack trace only in development mode (never in production)
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
