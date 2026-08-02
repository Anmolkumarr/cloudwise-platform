import Recommendation from "../models/Recommendation.js";

export const getRecommendations = async (req, res, next) => {
  try {
    const recommendations = await Recommendation.find({ user: req.user._id }).sort({ saving: -1 });
    const totalSavings = recommendations.reduce((s, r) => s + r.saving, 0);
    res.json({ recommendations, totalSavings: totalSavings.toFixed(2) });
  } catch (error) {
    next(error);
  }
};
