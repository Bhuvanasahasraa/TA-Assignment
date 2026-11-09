/** Formats an 8-digit Singapore number as "6812 9414" for readability. */
export function formatContactNumber(value: string): string {
  return /^\d{8}$/.test(value) ? `${value.slice(0, 4)} ${value.slice(4)}` : value;
}
