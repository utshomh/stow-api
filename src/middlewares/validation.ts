import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const flattened = result.error.flatten();

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: {
          fields: flattened.fieldErrors,
          form: flattened.formErrors,
        },
      });
    }

    req.body = result.data;
    next();
  };
