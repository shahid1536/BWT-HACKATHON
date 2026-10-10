import multer from 'multer';

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = 'An unexpected server error occurred. Please try again.';

  // Multer Error Handling
  if (err instanceof multer.MulterError) {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size exceeds the 15MB limit. Please upload a smaller file.';
    } else {
      message = `File upload error: ${err.message}`;
    }
  }

  // Mongoose Validation Error
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors || {}).map((e) => e.message);
    message = errors.length > 0 ? errors.join(', ') : 'Invalid data submitted.';
  }

  // Mongoose Duplicate Key Error (e.g. unique email)
  else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'record';
    message = `An account with this ${field} already exists.`;
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource identifier format.';
  }

  // Mongoose Connection or Buffer Timeout
  else if (err.name === 'MongooseServerSelectionError' || err.name === 'MongoNetworkError' || (err.message && err.message.includes('buffering timed out'))) {
    statusCode = 503;
    message = 'Database service is currently unreachable. Please verify MongoDB connection.';
  }

  // JWT / Auth errors
  else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session is invalid or has expired. Please log in again.';
  }

  // Custom 4xx Client Error with safe message
  else if (statusCode >= 400 && statusCode < 500 && err.message) {
    message = err.message;
  }

  console.error(
    `[Error] [${req.method} ${req.originalUrl}] Status: ${statusCode} - ${err.message}`
  );

  // Return clean, safe response WITHOUT stack trace or internal system details
  res.status(statusCode).json({
    success: false,
    message,
  });
};
