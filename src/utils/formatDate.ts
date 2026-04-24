export type DateInput = string | Date | undefined;

/**
 * Converts a DateInput to a Date object considering the mode only date or datetime.
 */
export function toDate(value: DateInput, mode: 'date' | 'datetime' = 'date'): Date | undefined {
  if (!value) return undefined;

  if (value instanceof Date) return value;

  if (mode === 'date') {
    return parseDateOnly(value);
  }

  return parseDateTime(value);
}

function parseDateTime(value: string): Date {
  return new Date(value);
}

function parseDateOnly(value: string): Date {
  const datePart = value.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);

  return new Date(year, month - 1, day);
}

/**
 * Formats a Date object to a string using the Intl.DateTimeFormat API.
 */
export function formatDate(
  value: DateInput,
  locale: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string {
  const date = toDate(value);

  if (!date || isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, options).format(date);
}

/**
 * Formats a Date object to a string using the Intl.DateTimeFormat API with date and time.
 */
export function formatDateTime(value: DateInput, locale: string): string {
  const date = toDate(value, 'datetime');

  if (!date || isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'medium'
  }).format(date);
}

/**
 * Converts a Date object to a ISO date string without time zone (YYYY-MM-DD).
 */
export function toISODateString(value: DateInput): string {
  const date = toDate(value);

  if (!date || isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
