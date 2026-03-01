import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

interface ErrorResponse {
  success: false;
  message: string;
  details?: any;
}

/**
 * Global error handler that normalizes different error types into consistent API responses
 * Handles Prisma errors, validation errors, and custom application errors
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction,
) => {
  console.error(err);

  // Prisma database constraint violations
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        // Unique constraint violation (e.g., duplicate email)
        return res.status(409).json({
          success: false,
          message: "A record with this value already exists",
          details: err.meta,
        });
      case "P2025":
        // Record not found during update/delete
        return res.status(404).json({
          success: false,
          message: "Record not found",
        });
      case "P2003":
        // Foreign key constraint violation (e.g., referencing non-existent parent)
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

  // Prisma schema validation errors (wrong data types, missing required fields)
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message: "Invalid data provided",
    });
  }

  // Zod schema validation errors from request validation middleware
  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      details: err.errors,
    });
  }

  // Custom application errors with status codes
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    message,
    details: err.details || undefined,
  });
};
