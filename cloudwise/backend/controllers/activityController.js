import Activity from "../models/Activity.js";

export const getActivity = async (req, res, next) => {
  try {
    const activities = await Activity.find({ user: req.user._id }).sort({ time: -1 }).limit(20);
    res.json(activities);
  } catch (error) {
    next(error);
  }
};
