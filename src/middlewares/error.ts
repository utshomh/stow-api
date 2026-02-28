import { Request, Response, NextFunction } from "express";

interface ErrorResponse {
  success: false;
  message: string;
  details?: any;
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction,
) => {
  console.error(err);

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    message,
    details: err.details || undefined,
  });
};
