/**
 * Presentation and report formatting helpers.
 */

export function formatNumber(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) {
    return '0';
  }
  return new Intl.NumberFormat('en-IN').format(val);
}

export function formatTwoDigits(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) {
    return '00';
  }
  return String(Math.floor(val)).padStart(2, '0');
}
