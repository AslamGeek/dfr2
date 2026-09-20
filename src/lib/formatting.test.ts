import { describe, it, expect } from 'vitest';
import { formatNumber, formatTwoDigits } from './formatting';

describe('Formatting Utilities', () => {
  it('formats numbers with thousands separators', () => {
    expect(formatNumber(15000)).toBe('15,000');
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(1250500)).toBe('12,50,500'); // en-IN grouping
  });

  it('formats two digits for days/counts', () => {
    expect(formatTwoDigits(5)).toBe('05');
    expect(formatTwoDigits(12)).toBe('12');
  });
});
