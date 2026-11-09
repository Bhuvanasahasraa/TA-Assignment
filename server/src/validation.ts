import { z } from 'zod';

/** A required, trimmed string field with field-named error messages. */
export function requiredString(field: string, maxLength: number) {
  return z
    .string({
      error: (issue) => (issue.input === undefined ? `${field} is required` : `${field} must be a string`),
    })
    .trim()
    .min(1, { error: `${field} must not be empty` })
    .max(maxLength, { error: `${field} must be at most ${maxLength} characters` });
}

export function emailField(field: string) {
  return requiredString(field, 254)
    .toLowerCase()
    .pipe(z.email({ error: `${field} must be a valid email address` }));
}

export function oneOf<const T extends readonly [string, ...string[]]>(field: string, values: T) {
  return z.enum(values, {
    error: (issue) =>
      issue.input === undefined ? `${field} is required` : `${field} must be one of: ${values.join(', ')}`,
  });
}

export function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join('; ');
}
