// Mirrors server/src/constants.ts – the API rejects values outside these lists.
export const SUBJECTS = [
  'English Language',
  'Mother Tongue Language',
  'Mathematics',
  'Science',
  'Art',
  'Music',
  'Physical Education',
  'Social Studies',
  'Character and Citizenship Education',
] as const;

export const LEVELS = ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'] as const;

export const CONTACT_NUMBER_PATTERN = /^\d{8}$/;
