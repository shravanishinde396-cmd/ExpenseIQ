import { create } from 'zustand';

const currencyMap = {
  INR: { locale: 'en-IN', symbol: '₹' },
  USD: { locale: 'en-US', symbol: '$' },
  EUR: { locale: 'de-DE', symbol: '€' },
  GBP: { locale: 'en-GB', symbol: '£' },
};

export const useCurrencyStore = create((set) => ({
  currency: 'INR',
  locale: 'en-IN',
  symbol: '₹',

  setCurrency: (currency) => {
    const config = currencyMap[currency] || { locale: 'en-IN', symbol: '₹' };
    set({
      currency,
      locale: config.locale,
      symbol: config.symbol,
    });
  },
}));
