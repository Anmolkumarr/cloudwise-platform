import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["EC2", "S3", "RDS", "IAM"], required: true },
    name: { type: String, required: true },
    resourceId: { type: String, required: true },
    region: { type: String, default: "ap-south-1" },
    status: { type: String, enum: ["running", "stopped", "warning", "active"], default: "running" },
    cost: { type: Number, default: 0 },

    // EC2 specific
    instanceType: String,
    cpuUsage: Number,

    // S3 specific
    storageUsedGB: Number,
    storageClass: String,

    // RDS specific
    engine: String,
    performanceScore: Number,

    // IAM specific
    mfaEnabled: Boolean,
    roles: [String],
    lastActive: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Resource", resourceSchema);
