/**
 * Format a ₹ INR amount in Indian shorthand.
 *
 *  formatINR(2500000)   → "₹25L"
 *  formatINR(25000000)  → "₹2.5Cr"
 *  formatINR(1000)      → "₹1,000"
 *  formatINR(100000)    → "₹1L"
 *  formatINR(9999)      → "₹9,999"
 *  formatINR(45299953)  → "₹4.5Cr"
 *  formatINR(0)         → "₹0"
 */
export function formatINR(amount: number, decimals = 1): string {
  if (!isFinite(amount)) return '₹—';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 1_00_00_000) {
    // Crores (1 Cr = 1,00,00,000)
    const cr = abs / 1_00_00_000;
    return `${sign}₹${trimDecimals(cr, decimals)}Cr`;
  }
  if (abs >= 1_00_000) {
    // Lakhs (1 L = 1,00,000)
    const l = abs / 1_00_000;
    return `${sign}₹${trimDecimals(l, decimals)}L`;
  }
  // Below 1 lakh — use Indian comma grouping
  return `${sign}₹${toIndianCommas(Math.round(abs))}`;
}

/**
 * Full Indian-locale string (for detail screens).
 *  fullINR(45299953) → "₹45,29,953"
 */
export function fullINR(amount: number): string {
  if (!isFinite(amount)) return '₹—';
  return `₹${toIndianCommas(Math.round(Math.abs(amount)))}`;
}

function trimDecimals(n: number, places: number): string {
  const fixed = n.toFixed(places);
  // Strip trailing zeros after decimal point
  return fixed.replace(/\.?0+$/, '');
}

function toIndianCommas(n: number): string {
  const s = String(n);
  if (s.length <= 3) return s;
  // Last 3 digits, then groups of 2
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  const restGrouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${restGrouped},${last3}`;
}
