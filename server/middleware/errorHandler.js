'use strict';

/**
 * Global Express error handler.
 * Catches Mongoose validation errors, duplicate key errors,
 * and generic server errors with consistent JSON responses.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let status  = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    status  = 400;
    const fields = Object.values(err.errors).map(e => ({ field: e.path, message: e.message }));
    return res.status(status).json({ success: false, message: 'Validation error', errors: fields });
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    status  = 409;
    message = 'A record with this information already exists.';
    return res.status(status).json({ success: false, message });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    status  = 400;
    message = `Invalid value for field: ${err.path}`;
    return res.status(status).json({ success: false, message });
  }

  // Generic
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', err);
  }

  res.status(status).json({ success: false, message });
}

export default errorHandler;
