import Resource from "../models/Resource.js";
import Alert from "../models/Alert.js";
import Recommendation from "../models/Recommendation.js";
import Cost from "../models/Cost.js";

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// @desc Global search across resources, alerts, recommendations, reports
// @route GET /api/search?q=term
export const globalSearch = async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) {
      return res.json({ resources: [], alerts: [], recommendations: [], reports: [] });
    }

    const regex = new RegExp(escapeRegex(q), "i");
    const userId = req.user._id;

    const [resources, alerts, recommendations, costs] = await Promise.all([
      Resource.find({
        user: userId,
        $or: [{ name: regex }, { resourceId: regex }, { type: regex }, { region: regex }, { status: regex }],
      }).limit(6),

      Alert.find({
        user: userId,
        $or: [{ type: regex }, { message: regex }, { resource: regex }, { severity: regex }],
      }).limit(6),

      Recommendation.find({
        user: userId,
        $or: [{ action: regex }, { issue: regex }, { resource: regex }, { category: regex }],
      }).limit(6),

      Cost.find({ user: userId, service: regex }).limit(1000),
    ]);

    // Build pseudo "report" results — service-level cost summaries matching the query
    const serviceSet = [...new Set(costs.map((c) => c.service))];
    const reports = serviceSet.map((service) => {
      const total = costs.filter((c) => c.service === service).reduce((s, c) => s + c.amount, 0);
      return { service, total: Number(total.toFixed(2)) };
    });

    // Also allow matching generic report keywords
    if (["report", "reports", "summary"].some((kw) => kw.includes(q.toLowerCase()) || q.toLowerCase().includes(kw))) {
      if (reports.length === 0) {
        reports.push({ service: "All Services", total: null });
      }
    }

    res.json({ resources, alerts, recommendations, reports });
  } catch (error) {
    next(error);
  }
};