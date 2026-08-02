export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const validatePassword = (password) => {
  if (!password || password.length < 6) return "Password must be at least 6 characters";
  return "";
};