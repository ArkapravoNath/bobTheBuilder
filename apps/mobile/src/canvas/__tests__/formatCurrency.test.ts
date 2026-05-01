/** @jest-environment node */
import { formatINR, fullINR } from '../../utils/formatCurrency';

describe('formatINR', () => {
  it('formats crores', () => {
    expect(formatINR(10_00_00_000)).toBe('₹10Cr');
    expect(formatINR(2_50_00_000)).toBe('₹2.5Cr');
    expect(formatINR(64_00_00_000)).toBe('₹64Cr');
    expect(formatINR(45_29_953)).toBe('₹45.3L');  // 45.3 lakhs, not crores
  });

  it('formats lakhs', () => {
    expect(formatINR(1_00_000)).toBe('₹1L');
    expect(formatINR(2_50_000)).toBe('₹2.5L');
    expect(formatINR(45_00_000)).toBe('₹45L');
    expect(formatINR(99_999)).toBe('₹99,999');
  });

  it('formats below 1 lakh with commas', () => {
    expect(formatINR(1000)).toBe('₹1,000');
    expect(formatINR(9999)).toBe('₹9,999');
    expect(formatINR(0)).toBe('₹0');
  });

  it('handles negatives', () => {
    expect(formatINR(-2_50_000)).toBe('-₹2.5L');
  });
});

describe('fullINR', () => {
  it('uses Indian comma grouping', () => {
    expect(fullINR(45_29_953)).toBe('₹45,29,953');
    expect(fullINR(1_00_000)).toBe('₹1,00,000');
    expect(fullINR(999)).toBe('₹999');
  });
});
