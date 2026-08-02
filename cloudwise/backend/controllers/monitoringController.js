import Resource from "../models/Resource.js";

export const getSystemHealth = async (req, res, next) => {
  try {
    const resources = await Resource.find({ user: req.user._id });
    const running = resources.filter((r) => r.status === "running" || r.status === "active").length;
    const total = resources.length || 1;
    const healthScore = Math.round((running / total) * 100);

    const ec2WithCpu = resources.filter((r) => r.type === "EC2" && r.cpuUsage != null);
    const avgCpu = ec2WithCpu.length
      ? Math.round(ec2WithCpu.reduce((s, r) => s + r.cpuUsage, 0) / ec2WithCpu.length)
      : 0;

    res.json({
      healthScore,
      status: healthScore > 80 ? "All Systems Operational" : healthScore > 50 ? "Degraded Performance" : "Major Outage",
      avgCpu,
      resources: resources.map((r) => ({
        name: r.name,
        type: r.type,
        status: r.status,
        cpuUsage: r.cpuUsage,
      })),
    });
  } catch (error) {
    next(error);
  }
};
