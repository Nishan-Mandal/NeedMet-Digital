/**
 * Format number to Indian Rupee currency.
 * Example:
 * formatCurrency(1499)
 * => ₹1,499
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format percentage.
 * Example:
 * formatPercentage(5)
 * => 5%
 */
export const formatPercentage = (value) => `${value}%`;

/**
 * Format large numbers.
 * Example:
 * formatNumber(1200)
 * => 1,200
 */
export const formatNumber = (value) => {
  return new Intl.NumberFormat("en-IN").format(value);
};

/**
 * Capitalize first letter.
 */
export const capitalize = (text = "") =>
  text.charAt(0).toUpperCase() + text.slice(1);