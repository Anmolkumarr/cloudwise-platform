import Settings from "../models/Settings.js";

const VALID_THEMES = ["dark", "light"];
const VALID_CURRENCIES = ["USD", "INR", "EUR", "GBP"];

// @desc Get current user's settings (creates defaults if none exist)
// @route GET /api/settings
export const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ user: req.user._id });
    if (!settings) {
      settings = await Settings.create({ user: req.user._id });
    }
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// @desc Update current user's settings (creates if none exist)
// @route PUT /api/settings
export const updateSettings = async (req, res, next) => {
  try {
    const { theme, notifications, language, timezone, currency, budgetLimit } = req.body;

    if (theme && !VALID_THEMES.includes(theme)) {
      return res.status(400).json({ message: "Invalid theme value" });
    }
    if (currency && !VALID_CURRENCIES.includes(currency)) {
      return res.status(400).json({ message: "Invalid currency value" });
    }
    if (budgetLimit != null && (isNaN(budgetLimit) || budgetLimit < 0)) {
      return res.status(400).json({ message: "Budget limit must be a positive number" });
    }

    const update = {};
    if (theme) update.theme = theme;
    if (notifications) update.notifications = notifications;
    if (language) update.language = language;
    if (timezone) update.timezone = timezone;
    if (currency) update.currency = currency;
    if (budgetLimit != null) update.budgetLimit = budgetLimit;

    const settings = await Settings.findOneAndUpdate(
      { user: req.user._id },
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(settings);
  } catch (error) {
    next(error);
  }
};