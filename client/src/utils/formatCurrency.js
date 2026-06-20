import { useCurrencyStore } from '../store/currencyStore';

/**
 * Format amount in paise (or cents) to localized currency format.
 * @param {number} amountInPaise - The integer amount in the smallest currency unit.
 * @param {string} [overrideCurrency] - Optional currency symbol override.
 * @returns {string} Formatted string (e.g. ₹12,345.67 or $123.45).
 */
export function formatCurrency(amountInPaise, overrideCurrency) {
  const currentStore = useCurrencyStore.getState();
  const currency = overrideCurrency || currentStore.currency;
  
  const amount = Number(amountInPaise || 0) / 100;

  try {
    return new Intl.NumberFormat(
      currency === 'INR' ? 'en-IN' : 
      currency === 'USD' ? 'en-US' : 
      currency === 'EUR' ? 'de-DE' : 'en-GB',
      {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(amount);
  } catch (error) {
    // Fallback if Intl fails
    const symbol = currency === 'INR' ? '₹' : 
                   currency === 'USD' ? '$' : 
                   currency === 'EUR' ? '€' : '£';
    return `${symbol}${amount.toFixed(2)}`;
  }
}
