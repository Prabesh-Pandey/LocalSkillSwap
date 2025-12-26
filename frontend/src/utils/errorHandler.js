/**
 * Utility function to extract error message from various error formats
 * @param {Error|Object} error - The error object
 * @param {string} fallbackMessage - Default message if no error message found
 * @returns {string} - The error message
 */
export const getErrorMessage = (error, fallbackMessage = 'Something went wrong') => {
  if (!error) return fallbackMessage;
  
  // Handle Axios error response
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Handle Axios error response with error field
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  // Handle standard Error objects
  if (error.message) {
    return error.message;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  return fallbackMessage;
};

/**
 * Handle API response errors and provide user-friendly messages
 * @param {Error} error - The error object
 * @returns {string} - User-friendly error message
 */
export const handleApiError = (error) => {
  // Network errors
  if (error.code === 'ERR_NETWORK' || !navigator.onLine) {
    return 'Network error. Please check your internet connection.';
  }
  
  // Timeout errors
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }
  
  // HTTP status-based errors
  const status = error.response?.status;
  switch (status) {
    case 400:
      return getErrorMessage(error, 'Invalid request. Please check your input.');
    case 401:
      return 'Please login to continue.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return getErrorMessage(error, 'A conflict occurred. The resource may already exist.');
    case 422:
      return getErrorMessage(error, 'Validation failed. Please check your input.');
    case 429:
      return 'Too many requests. Please wait and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
    case 503:
    case 504:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return getErrorMessage(error);
  }
};
