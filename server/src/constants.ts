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

export const LEVELS = [
  'Primary 1',
  'Primary 2',
  'Primary 3',
  'Primary 4',
  'Primary 5',
  'Primary 6',
] as const;

export type Subject = (typeof SUBJECTS)[number];
export type Level = (typeof LEVELS)[number];
