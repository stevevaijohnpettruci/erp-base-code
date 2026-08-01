import response from '../utils/response.js';
import { ClientError } from '../exceptions/index.js';
import logger from '../utils/logger.js'; // Pastikan path import ini sesuai

const ErrorHandler = (error, req, res, next) => {
  const requestDetails = `${req.originalUrl} - ${req.method} - ${req.ip}`;

  if (error instanceof ClientError) {
    logger.warn(
      `ClientError (${error.statusCode}): ${error.message} - ${requestDetails}`,
    );
    return response(res, error.statusCode, error.message, null);
  }

  if (error.isJoi) {
    const joiMessage = error.details.map((detail) => detail.message).join(', ');
    logger.warn(`ValidationError (400): ${joiMessage} - ${requestDetails}`);
    return response(res, 400, error.details[0].message, null);
  }

  const status = error.statusCode || error.status || 500;
  const message = error.message || 'Internal Server Error';

  logger.error(
    `Unhandled System Error (${status}): ${message} - ${requestDetails}`,
    error,
  );

  return response(res, status, message, null);
};

export default ErrorHandler;
