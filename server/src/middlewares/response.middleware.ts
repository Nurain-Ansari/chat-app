import { Request, Response } from 'express';
import mongoose from 'mongoose';

type ErrorLike = string | unknown;

export const successResponse = (
  res: Response,
  data = {},
  message = 'Success',
  statusCode = 200,
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
  return;
};

// export const errorResponse = (res: Response, error = 'Something went wrong', statusCode = 400) => {
//   res.status(statusCode).json({
//     success: false,
//     message: error,
//     data: null,
//   });
//   return;
// };

/**
 * Sends a standardized error response to the client.
 * Supports both message-based and unknown error-based calls.
 */
export const errorResponse = (
  reqOrRes: Request | Response,
  resOrError: Response | ErrorLike = 'Something went wrong',
  errorOrStatusCode?: ErrorLike | number,
  statusCode = 400,
): void => {
  let res: Response;
  let error: ErrorLike;

  // Determine the call style
  if ('status' in reqOrRes) {
    // Style 1: errorResponse(res, error, statusCode)
    res = reqOrRes;
    error = resOrError;
    statusCode = typeof errorOrStatusCode === 'number' ? errorOrStatusCode : 400;
  } else {
    // Style 2: errorResponse(req, res, err: unknown)
    res = resOrError as Response;
    error = errorOrStatusCode;
    statusCode = 400; // or infer from error later if needed
  }

  // Process `error` if it's unknown or complex
  let message = 'Something went wrong';

  if (typeof error === 'string') {
    message = error;
  } else if (error instanceof mongoose.Error.ValidationError) {
    message = Object.values(error.errors)
      .map((e) => e.message)
      .join(', ');
    statusCode = 400;
  } else if (error instanceof Error) {
    message = error.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};
