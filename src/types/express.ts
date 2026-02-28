import { Request } from "express";

/**
 * Extended Express Request interface with authenticated user ID
 * Set by the authenticate middleware
 */
export interface AppRequest extends Request {
  userId?: string;
  file?: Express.Multer.File;
}

