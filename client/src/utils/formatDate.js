import { useCurrencyStore } from '../store/currencyStore';

/**
 * Format a date string or Date object into the user's localized format.
 * @param {string|Date} dateVal - Date input.
 * @param {object} [options] - Optional Intl.DateTimeFormat settings.
 * @returns {string} Formatted date string (e.g. "Dec 15, 2024").
 */
export function formatDate(dateVal, options = {}) {
  if (!dateVal) return '';
  const dateObj = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };

  const locale = useCurrencyStore.getState().locale || 'en-IN';

  try {
    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  } catch (error) {
    return dateObj.toLocaleDateString();
  }
}

/**
 * Format a date to relative time (e.g., "2h ago", "yesterday", etc.)
 * @param {string|Date} dateVal
 * @returns {string}
 */
export function formatRelativeTime(dateVal) {
  if (!dateVal) return '';
  const date = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
  const now = new Date();
  const diffInMs = now - date;
  const diffInMins = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMins < 1) return 'just now';
  if (diffInMins < 60) return `${diffInMins}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays === 1) return 'yesterday';
  return formatDate(date);
}
