import logger from '../utils/logger.js';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const response = {
    error: {
      message,
      statusCode,
    },
  };

  if (err.errors) {
    response.error.errors = err.errors;
  }

  res.status(statusCode).json(response);
};
