import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

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

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        // Unique constraint violation
        return res.status(409).json({
          success: false,
          message: "A record with this value already exists",
          details: err.meta,
        });
      case "P2025":
        // Record not found
        return res.status(404).json({
          success: false,
          message: "Record not found",
        });
      case "P2003":
        // Foreign key constraint violation
        return res.status(400).json({
          success: false,
          message: "Invalid reference to related record",
          details: err.meta,
        });
      default:
        return res.status(400).json({
          success: false,
          message: "Database error",
          details: err.meta,
        });
    }
  }

  // Handle Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message: "Invalid data provided",
    });
  }

  // Handle Zod validation errors (if thrown from validation middleware)
  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      details: err.errors,
    });
  }

  // Handle custom errors with status
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    message,
    details: err.details || undefined,
  });
};
