export const CURRENCY_SYMBOLS = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
};

export const getCurrencySymbol = (code) => CURRENCY_SYMBOLS[code] || "$";