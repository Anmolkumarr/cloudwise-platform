import Cost from "../models/Cost.js";

export const getCostAnalysis = async (req, res, next) => {
  try {
    const costs = await Cost.find({ user: req.user._id }).sort({ date: 1 });

    const daily = costs.map((c) => ({ date: c.date.toISOString().split("T")[0], amount: c.amount, service: c.service }));

    const monthlyMap = {};
    costs.forEach((c) => {
      const key = c.date.toISOString().slice(0, 7);
      monthlyMap[key] = (monthlyMap[key] || 0) + c.amount;
    });
    const monthly = Object.entries(monthlyMap).map(([month, amount]) => ({ month, amount }));

    const byService = ["EC2", "S3", "RDS", "IAM", "Others"].map((service) => ({
      service,
      amount: costs.filter((c) => c.service === service).reduce((s, c) => s + c.amount, 0),
    }));

    const total = costs.reduce((s, c) => s + c.amount, 0);

    res.json({ daily, monthly, byService, total: total.toFixed(2) });
  } catch (error) {
    next(error);
  }
};
