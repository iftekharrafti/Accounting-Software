/**
 * Success Response
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Error Response
 */
const errorResponse = (res, message = 'Error occurred', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Paginated Response
 */
const paginatedResponse = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination
  });
};

/**
 * Created Response
 */
const createdResponse = (res, data, message = 'Created successfully') => {
  return res.status(201).json({
    success: true,
    message,
    data
  });
};

/**
 * No Content Response
 */
const noContentResponse = (res) => {
  return res.status(204).send();
};

/**
 * Not Found Response
 */
const notFoundResponse = (res, message = 'Resource not found') => {
  return res.status(404).json({
    success: false,
    message
  });
};

/**
 * Validation Error Response
 */
const validationErrorResponse = (res, errors, message = 'Validation failed') => {
  return res.status(400).json({
    success: false,
    message,
    errors
  });
};

/**
 * Unauthorized Response
 */
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return res.status(401).json({
    success: false,
    message
  });
};

/**
 * Forbidden Response
 */
const forbiddenResponse = (res, message = 'Access forbidden') => {
  return res.status(403).json({
    success: false,
    message
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  createdResponse,
  noContentResponse,
  notFoundResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse
};