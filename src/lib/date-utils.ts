/**
 * Format date to Australian format (dd Month) - no year
 */
export function formatDateAU(date: string | Date | null | undefined): string {
  if (!date) return 'Not set';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return 'Invalid date';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = d.getDate();
  const month = months[d.getMonth()];

  return `${day} ${month}`;
}

/**
 * Convert date to yyyy-mm-dd format for input[type="date"]
 */
export function toInputDate(date: string | Date | null | undefined): string {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Get month and day for input (mm-dd format)
 */
export function toMonthDay(date: string | Date | null | undefined): string {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '';

  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${month}-${day}`;
}

/**
 * Convert mm-dd string to full date (using current year as placeholder)
 */
export function fromMonthDay(monthDay: string): string {
  if (!monthDay || !monthDay.includes('-')) return '';

  const [month, day] = monthDay.split('-');
  const year = new Date().getFullYear();

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
