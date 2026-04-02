import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  // Log the error
  if (err.isOperational) {
    logger.warn(`Operational error: ${err.message}`, {
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.error('Unexpected error:', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Handle specific error types
  if (err.code === 'ER_DUP_ENTRY') {
    err = ApiError.conflict('A record with this value already exists');
  }

  if (err.name === 'JsonWebTokenError') {
    err = ApiError.unauthorized('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    err = ApiError.unauthorized('Token expired');
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.errors?.length > 0 && { errors: err.errors }),
    ...(process.env.NODE_ENV === 'development' && !err.isOperational && { stack: err.stack }),
  });
};

export default errorHandler;
