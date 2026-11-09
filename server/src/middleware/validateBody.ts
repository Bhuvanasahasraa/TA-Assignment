import type { RequestHandler } from 'express';
import type { z } from 'zod';
import { BadRequestError } from '../errors';
import { formatZodError } from '../validation';

/** Validates and normalises `req.body` against the schema, replacing it with the parsed value. */
export function validateBody(schema: z.ZodType): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new BadRequestError(formatZodError(result.error));
    }
    req.body = result.data;
    next();
  };
}
