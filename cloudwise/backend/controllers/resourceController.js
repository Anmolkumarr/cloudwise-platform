import Resource from "../models/Resource.js";
import Cost from "../models/Cost.js";
import Activity from "../models/Activity.js";
import Alert from "../models/Alert.js";

const getByType = (type) => async (req, res, next) => {
  try {
    const resources = await Resource.find({ user: req.user._id, type });
    const costs = await Cost.find({ user: req.user._id, service: type }).sort({ date: 1 });
    res.json({ resources, costs });
  } catch (error) {
    next(error);
  }
};

export const getEC2 = getByType("EC2");
export const getS3 = getByType("S3");
export const getRDS = getByType("RDS");
export const getIAM = getByType("IAM");

// -------------------- Helpers --------------------
const randomId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const logActivity = (userId, action, resource) =>
  Activity.create({ user: userId, action, resource, time: new Date() });

const logCost = (userId, service, amount) =>
  Cost.create({ user: userId, service, amount, date: new Date() });

// -------------------- EC2 --------------------
// @desc Launch a new EC2 instance
// @route POST /api/ec2
export const createEC2 = async (req, res, next) => {
  try {
    const { name, instanceType = "t2.micro", region = "ap-south-1" } = req.body;
    if (!name) return res.status(400).json({ message: "Instance name is required" });

    const costPerDay = { "t2.nano": 0.8, "t2.micro": 4.2, "t2.small": 5.1, "t3.small": 6.1, "t3.medium": 8.4 }[instanceType] || 4.2;

    const resource = await Resource.create({
      user: req.user._id,
      type: "EC2",
      name,
      resourceId: randomId("i-0"),
      region,
      status: "running",
      instanceType,
      cpuUsage: Math.floor(Math.random() * 90) + 10,
      cost: costPerDay,
    });

    await logCost(req.user._id, "EC2", costPerDay);
    await logActivity(req.user._id, "EC2 Instance Launched", name);

    if (resource.cpuUsage > 75) {
      await Alert.create({
        user: req.user._id,
        type: "High EC2 CPU Utilization",
        message: `Instance ${resource.resourceId} CPU usage above 75%`,
        severity: "warning",
        resource: name,
      });
    }

    res.status(201).json(resource);
  } catch (error) {
    next(error);
  }
};

// -------------------- S3 --------------------
// @desc Create a new S3 bucket
// @route POST /api/s3
export const createS3 = async (req, res, next) => {
  try {
    const { name, storageClass = "Standard", region = "ap-south-1" } = req.body;
    if (!name) return res.status(400).json({ message: "Bucket name is required" });

    const existing = await Resource.findOne({ type: "S3", name });
    if (existing) return res.status(400).json({ message: "Bucket name already exists" });

    const storageUsedGB = Math.floor(Math.random() * 100) + 5;
    const cost = Number((storageUsedGB * 0.02).toFixed(2));

    const resource = await Resource.create({
      user: req.user._id,
      type: "S3",
      name,
      resourceId: randomId("s3-bucket"),
      region,
      status: "active",
      storageUsedGB,
      storageClass,
      cost,
    });

    await logCost(req.user._id, "S3", cost);
    await logActivity(req.user._id, "S3 Bucket Created", name);

    if (storageClass === "Glacier") {
      await Alert.create({
        user: req.user._id,
        type: "S3 Glacier Storage",
        message: `Bucket ${name} uses Glacier — retrieval may take hours`,
        severity: "info",
        resource: name,
      });
    }

    res.status(201).json(resource);
  } catch (error) {
    next(error);
  }
};

// -------------------- RDS --------------------
// @desc Create a new RDS database
// @route POST /api/rds
export const createRDS = async (req, res, next) => {
  try {
    const { name, engine = "PostgreSQL", region = "ap-south-1" } = req.body;
    if (!name) return res.status(400).json({ message: "Database name is required" });

    const cost = Number((Math.random() * 3 + 1.5).toFixed(2));
    const performanceScore = Math.floor(Math.random() * 30) + 70;

    const resource = await Resource.create({
      user: req.user._id,
      type: "RDS",
      name,
      resourceId: randomId("db-instance"),
      region,
      status: "running",
      engine,
      performanceScore,
      cost,
    });

    await logCost(req.user._id, "RDS", cost);
    await logActivity(req.user._id, "RDS Database Created", name);

    if (performanceScore < 75) {
      await Alert.create({
        user: req.user._id,
        type: "RDS Performance Below Threshold",
        message: `Database ${name} performance score is ${performanceScore}/100`,
        severity: "warning",
        resource: name,
      });
    }

    res.status(201).json(resource);
  } catch (error) {
    next(error);
  }
};

// -------------------- IAM --------------------
// @desc Add a new IAM user
// @route POST /api/iam
export const createIAM = async (req, res, next) => {
  try {
    const { name, roles = [], mfaEnabled = false } = req.body;
    if (!name) return res.status(400).json({ message: "User name is required" });

    const existing = await Resource.findOne({ type: "IAM", name });
    if (existing) return res.status(400).json({ message: "IAM user already exists" });

    const rolesArray = Array.isArray(roles)
      ? roles
      : String(roles)
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean);

    const resource = await Resource.create({
      user: req.user._id,
      type: "IAM",
      name,
      resourceId: randomId("iam-user"),
      region: "global",
      status: "active",
      mfaEnabled,
      roles: rolesArray.length ? rolesArray : ["ReadOnlyAccess"],
      lastActive: new Date(),
      cost: 0,
    });

    await logActivity(req.user._id, "IAM User Added", name);

    if (!mfaEnabled) {
      await Alert.create({
        user: req.user._id,
        type: "IAM MFA Disabled",
        message: `User ${name} does not have MFA enabled`,
        severity: "warning",
        resource: name,
      });
    }

    res.status(201).json(resource);
  } catch (error) {
    next(error);
  }
};

// -------------------- EC2 Status Toggle (Stop/Start) --------------------
// @desc Toggle EC2 instance status between running and stopped
// @route PUT /api/ec2/:id/toggle
export const toggleEC2Status = async (req, res, next) => {
  try {
    const resource = await Resource.findOne({ _id: req.params.id, user: req.user._id, type: "EC2" });
    if (!resource) return res.status(404).json({ message: "Instance not found" });

    const costPerDay = { "t2.nano": 0.8, "t2.micro": 4.2, "t2.small": 5.1, "t3.small": 6.1, "t3.medium": 8.4 }[resource.instanceType] || 4.2;

    if (resource.status === "stopped") {
      resource.status = "running";
      resource.cost = costPerDay;
    } else {
      resource.status = "stopped";
      resource.cost = 0;
      resource.cpuUsage = 0;
    }

    await resource.save();
    await logActivity(req.user._id, `EC2 Instance ${resource.status === "running" ? "Started" : "Stopped"}`, resource.name);

    res.json(resource);
  } catch (error) {
    next(error);
  }
};

// -------------------- EC2 Delete --------------------
// @desc Delete an EC2 instance
// @route DELETE /api/ec2/:id
export const deleteEC2 = async (req, res, next) => {
  try {
    const resource = await Resource.findOneAndDelete({ _id: req.params.id, user: req.user._id, type: "EC2" });
    if (!resource) return res.status(404).json({ message: "Instance not found" });

    await logActivity(req.user._id, "EC2 Instance Deleted", resource.name);

    res.json({ message: "Instance deleted", id: req.params.id });
  } catch (error) {
    next(error);
  }
};

// -------------------- RDS Toggle (Stop/Start) --------------------
// @desc Toggle RDS database status between running and stopped
// @route PUT /api/rds/:id/toggle
export const toggleRDSStatus = async (req, res, next) => {
  try {
    const resource = await Resource.findOne({ _id: req.params.id, user: req.user._id, type: "RDS" });
    if (!resource) return res.status(404).json({ message: "Database not found" });

    if (resource.status === "stopped") {
      resource.status = "running";
      resource.cost = Number((Math.random() * 3 + 1.5).toFixed(2));
    } else {
      resource.status = "stopped";
      resource.cost = 0;
    }

    await resource.save();
    await logActivity(req.user._id, `RDS Database ${resource.status === "running" ? "Started" : "Stopped"}`, resource.name);

    res.json(resource);
  } catch (error) {
    next(error);
  }
};

// -------------------- RDS Delete --------------------
// @desc Delete an RDS database
// @route DELETE /api/rds/:id
export const deleteRDS = async (req, res, next) => {
  try {
    const resource = await Resource.findOneAndDelete({ _id: req.params.id, user: req.user._id, type: "RDS" });
    if (!resource) return res.status(404).json({ message: "Database not found" });

    await logActivity(req.user._id, "RDS Database Deleted", resource.name);

    res.json({ message: "Database deleted", id: req.params.id });
  } catch (error) {
    next(error);
  }
};

// -------------------- S3 Delete --------------------
// @desc Delete an S3 bucket
// @route DELETE /api/s3/:id
export const deleteS3 = async (req, res, next) => {
  try {
    const resource = await Resource.findOneAndDelete({ _id: req.params.id, user: req.user._id, type: "S3" });
    if (!resource) return res.status(404).json({ message: "Bucket not found" });

    await logActivity(req.user._id, "S3 Bucket Deleted", resource.name);

    res.json({ message: "Bucket deleted", id: req.params.id });
  } catch (error) {
    next(error);
  }
};

// -------------------- IAM Delete --------------------
// @desc Delete an IAM user
// @route DELETE /api/iam/:id
export const deleteIAM = async (req, res, next) => {
  try {
    const resource = await Resource.findOneAndDelete({ _id: req.params.id, user: req.user._id, type: "IAM" });
    if (!resource) return res.status(404).json({ message: "IAM user not found" });

    await logActivity(req.user._id, "IAM User Deleted", resource.name);

    res.json({ message: "IAM user deleted", id: req.params.id });
  } catch (error) {
    next(error);
  }
};
