/**
 * Date utility functions to handle timezone-safe date conversions
 */

/**
 * Convert a Date object to YYYY-MM-DD format without timezone conversion
 * This ensures the date stays the same regardless of timezone
 * 
 * @param date - The date to format
 * @returns String in YYYY-MM-DD format
 */
export const formatDateToYMD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parse a YYYY-MM-DD string to a Date object
 * Uses local timezone to avoid day-off errors
 * 
 * @param dateString - String in YYYY-MM-DD format
 * @returns Date object
 */
export const parseDateFromYMD = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  const parts = dateString.split('-');
  if (parts.length !== 3) return null;
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const day = parseInt(parts[2], 10);
  
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  
  return new Date(year, month, day);
};

/**
 * Format a date for display (e.g., "January 1, 1990")
 * 
 * @param date - Date to format
 * @returns Formatted date string
 */
export const formatDateForDisplay = (date: Date | null): string => {
  if (!date) return '';
  
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format a date string (YYYY-MM-DD) for display
 * 
 * @param dateString - String in YYYY-MM-DD format
 * @returns Formatted date string
 */
export const formatDateStringForDisplay = (dateString: string): string => {
  const date = parseDateFromYMD(dateString);
  return formatDateForDisplay(date);
};
