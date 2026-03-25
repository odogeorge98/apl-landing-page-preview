/**
 * Centralized Error Handling Utility
 * Provides consistent error handling across API calls
 */

import { toast } from "sonner";

/**
 * Handles API errors with consistent error throwing
 * @param error - The error to handle
 * @param defaultMessage - Default message if error is not an Error instance
 * @throws Error with appropriate message
 */
export const handleApiError = (
  error: unknown,
  defaultMessage: string
): never => {
  if (error instanceof Error) {
    throw error;
  }
  throw new Error(defaultMessage);
};

/**
 * Shows validation errors as toast notifications
 * @param validationErrors - Object containing validation error messages
 */
export const showValidationError = (
  validationErrors: Record<string, string | undefined>
): void => {
  const errorMessages = Object.values(validationErrors).filter(Boolean) as string[];

  if (errorMessages.length > 0) {
    // Show the first validation error as a toast
    toast.error(errorMessages[0]);
  }
};

/**
 * Shows success messages as toast notifications
 * @param message - Success message to display
 */
export const showSuccess = (message: string): void => {
  toast.success(message);
};

/**
 * Shows error messages as toast notifications
 * @param message - Error message to display
 */
export const showError = (message: string): void => {
  toast.error(message);
};
