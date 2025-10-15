/**
 * Shared Date Utility Functions
 * Contains reusable date formatting and manipulation utilities
 */

/**
 * Converts a Date object to ISO date string (YYYY-MM-DD)
 * @param date - Date object or unknown value
 * @returns ISO date string or undefined if input is not a valid Date
 */
export function toIsoDate(date: unknown): string | undefined {
  if (!(date instanceof Date)) {
    return undefined;
  }
  
  // Return YYYY-MM-DD to match backend expectation
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts a Date object to ISO datetime string (YYYY-MM-DDTHH:mm:ss)
 * @param date - Date object or unknown value
 * @returns ISO datetime string or undefined if input is not a valid Date
 */
export function toIsoDateTime(date: unknown): string | undefined {
  if (!(date instanceof Date)) {
    return undefined;
  }
  
  return date.toISOString();
}

/**
 * Parses an ISO date string to a Date object
 * @param isoDate - ISO date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
 * @returns Date object or null if parsing fails
 */
export function fromIsoDate(isoDate: string | null | undefined): Date | null {
  if (!isoDate) {
    return null;
  }
  
  const date = new Date(isoDate);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Formats a date to a localized string
 * @param date - Date object or ISO string
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | null | undefined, locale: string = 'en-US'): string {
  if (!date) {
    return '';
  }
  
  const dateObj = typeof date === 'string' ? fromIsoDate(date) : date;
  if (!dateObj) {
    return '';
  }
  
  return dateObj.toLocaleDateString(locale);
}

/**
 * Checks if a date is today
 * @param date - Date object to check
 * @returns True if the date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

/**
 * Adds days to a date
 * @param date - Base date
 * @param days - Number of days to add (can be negative)
 * @returns New date object
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
