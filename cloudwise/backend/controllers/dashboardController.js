import Resource from "../models/Resource.js";
import Cost from "../models/Cost.js";
import Alert from "../models/Alert.js";
import Recommendation from "../models/Recommendation.js";
import Activity from "../models/Activity.js";
import Settings from "../models/Settings.js";

export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const resources = await Resource.find({ user: userId });
    const costs = await Cost.find({ user: userId }).sort({ date: 1 });
    const alerts = await Alert.find({ user: userId }).sort({ createdAt: -1 }).limit(5);
    const recommendations = await Recommendation.find({ user: userId }).sort({ saving: -1 }).limit(5);
    const activities = await Activity.find({ user: userId }).sort({ time: -1 }).limit(6);
    const settings = await Settings.findOne({ user: userId });
    const budgetLimit = settings?.budgetLimit ?? 200;
    const currency = settings?.currency ?? "USD";

    const ec2 = resources.filter((r) => r.type === "EC2");
    const s3 = resources.filter((r) => r.type === "S3");
    const rds = resources.filter((r) => r.type === "RDS");
    const iam = resources.filter((r) => r.type === "IAM");

    const totalCost = costs.reduce((sum, c) => sum + c.amount, 0);

    const costByService = ["EC2", "S3", "RDS", "IAM", "Others"].map((service) => ({
      service,
      amount: costs.filter((c) => c.service === service).reduce((s, c) => s + c.amount, 0),
    }));

    const running = resources.filter((r) => r.status === "running" || r.status === "active").length;
    const stopped = resources.filter((r) => r.status === "stopped").length;
    const warning = resources.filter((r) => r.status === "warning").length;

    // group cost by date for line chart
    const costByDateMap = {};
    costs.forEach((c) => {
      const key = c.date.toISOString().split("T")[0];
      costByDateMap[key] = (costByDateMap[key] || 0) + c.amount;
    });
    const costOverview = Object.entries(costByDateMap).map(([date, amount]) => ({ date, amount }));

    res.json({
      currency,
      cards: {
        totalCost: totalCost.toFixed(2),
        ec2Count: ec2.length,
        ec2Running: ec2.filter((r) => r.status === "running").length,
        s3Count: s3.length,
        rdsCount: rds.length,
        rdsAvailable: rds.filter((r) => r.status === "running" || r.status === "active").length,
        iamCount: iam.length,
      },
      costOverview,
      costByService,
      resourceStatus: { running, stopped, warning, total: resources.length },
      resourceDistribution: { ec2: ec2.length, s3: s3.length, rds: rds.length, iam: iam.length },
      alerts,
      recommendations,
      activities,
      costForecast: (totalCost * 3).toFixed(2),
      budget: { used: totalCost.toFixed(2), total: budgetLimit },
    });
  } catch (error) {
    next(error);
  }
};