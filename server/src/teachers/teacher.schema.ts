import { z } from 'zod';
import { SUBJECTS } from '../constants';
import { emailField, oneOf, requiredString } from '../validation';

export const createTeacherSchema = z.strictObject({
  name: requiredString('name', 100),
  subject: oneOf('subject', SUBJECTS),
  email: emailField('email'),
  contactNumber: requiredString('contactNumber', 8).regex(/^\d{8}$/, {
    error: 'contactNumber must be an 8-digit number',
  }),
});

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
