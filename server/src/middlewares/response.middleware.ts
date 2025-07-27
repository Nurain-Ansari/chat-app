import { Response } from 'express';

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

export const errorResponse = (res: Response, error = 'Something went wrong', statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    message: error,
    data: null,
  });
  return;
};
