const UNIQUE_VIOLATION = '23505';

export function isUniqueViolation(err: unknown, constraint?: string): boolean {
  if (typeof err !== 'object' || err === null) return false;
  const { code, constraint: violated } = err as { code?: string; constraint?: string };
  return code === UNIQUE_VIOLATION && (constraint === undefined || violated === constraint);
}
