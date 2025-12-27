/**
 * Date formatting utilities for consistent date display across the application
 */

type DateFormatOptions = {
  includeTime?: boolean;
  shortMonth?: boolean;
};

/**
 * Formats a date string for display
 * @param dateStr - ISO date string or undefined
 * @param options - Formatting options
 * @returns Formatted date string or '-' if no date provided
 */
export function formatDate(
  dateStr?: string | null,
  options: DateFormatOptions = {}
): string {
  if (!dateStr) return '-';

  const { includeTime = false, shortMonth = true } = options;

  const formatOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: shortMonth ? 'short' : 'long',
    year: 'numeric',
  };

  if (includeTime) {
    formatOptions.hour = '2-digit';
    formatOptions.minute = '2-digit';
    formatOptions.hour12 = false;
  }

  return new Date(dateStr).toLocaleString('en-GB', formatOptions);
}

/**
 * Formats a date for compact display (e.g., mobile cards)
 * Shows only day and short month (e.g., "27 Dec")
 */
export function formatDateCompact(dateStr?: string | null): string {
  if (!dateStr) return '-';

  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}
