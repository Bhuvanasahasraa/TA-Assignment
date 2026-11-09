import { z } from 'zod';
import { LEVELS } from '../constants';
import { emailField, oneOf, requiredString } from '../validation';

export const createClassSchema = z.strictObject({
  level: oneOf('level', LEVELS),
  name: requiredString('name', 50),
  teacherEmail: emailField('teacherEmail'),
});

export type CreateClassInput = z.infer<typeof createClassSchema>;
