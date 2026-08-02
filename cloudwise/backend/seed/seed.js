import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Resource from "../models/Resource.js";
import Cost from "../models/Cost.js";
import Recommendation from "../models/Recommendation.js";
import Alert from "../models/Alert.js";
import Activity from "../models/Activity.js";

dotenv.config();
await connectDB();

const run = async () => {
  try {
    console.log("Clearing old data...");
    await Promise.all([
      User.deleteMany({ email: "demo@cloudwise.com" }),
      Resource.deleteMany({}),
      Cost.deleteMany({}),
      Recommendation.deleteMany({}),
      Alert.deleteMany({}),
      Activity.deleteMany({}),
    ]);

    console.log("Creating demo user...");
    const user = await User.create({
      name: "Anmol",
      email: "demo@cloudwise.com",
      password: "demo1234",
      role: "admin",
      awsAccountId: "1234-5678-9012",
      awsAccountName: "anmolawsaccount",
    });

    // ---------- EC2 ----------
    const ec2Data = [
      { name: "web-server-01", instanceType: "t2.micro", status: "running", cpuUsage: 42, cost: 4.2 },
      { name: "web-server-02", instanceType: "t2.micro", status: "running", cpuUsage: 78, cost: 4.2 },
      { name: "api-server-01", instanceType: "t3.small", status: "running", cpuUsage: 55, cost: 6.1 },
      { name: "worker-node-01", instanceType: "t2.small", status: "stopped", cpuUsage: 0, cost: 0 },
      { name: "batch-processor", instanceType: "t3.medium", status: "warning", cpuUsage: 91, cost: 3.15 },
      { name: "test-instance", instanceType: "t2.nano", status: "stopped", cpuUsage: 0, cost: 0.8 },
    ];
    const ec2 = await Resource.insertMany(
      ec2Data.map((e, i) => ({
        user: user._id,
        type: "EC2",
        name: e.name,
        resourceId: `i-0a1b2c3d4e5f6g${i}${i}`,
        region: "ap-south-1",
        status: e.status,
        instanceType: e.instanceType,
        cpuUsage: e.cpuUsage,
        cost: e.cost,
      }))
    );

    // ---------- S3 ----------
    const s3Data = [
      { name: "cloudwise-logs-bucket", storageUsedGB: 120, storageClass: "Standard", cost: 2.4 },
      { name: "cloudwise-assets-bucket", storageUsedGB: 340, storageClass: "Standard", cost: 6.8 },
      { name: "old-backup-bucket", storageUsedGB: 80, storageClass: "Glacier", cost: 0.3 },
      { name: "user-uploads-bucket", storageUsedGB: 210, storageClass: "Standard", cost: 4.2 },
      { name: "static-website-bucket", storageUsedGB: 15, storageClass: "Standard", cost: 0.3 },
      { name: "db-backups-bucket", storageUsedGB: 95, storageClass: "Standard-IA", cost: 1.1 },
      { name: "analytics-data-bucket", storageUsedGB: 260, storageClass: "Standard", cost: 5.2 },
      { name: "archive-bucket", storageUsedGB: 500, storageClass: "Glacier", cost: 0.9 },
    ];
    const s3 = await Resource.insertMany(
      s3Data.map((s, i) => ({
        user: user._id,
        type: "S3",
        name: s.name,
        resourceId: `s3-bucket-${i}`,
        region: "ap-south-1",
        status: i === 2 ? "warning" : "active",
        storageUsedGB: s.storageUsedGB,
        storageClass: s.storageClass,
        cost: s.cost,
      }))
    );

    // ---------- RDS ----------
    const rdsData = [
      { name: "cloudwise-db", engine: "PostgreSQL", performanceScore: 88, cost: 4.5 },
      { name: "analytics-db", engine: "MySQL", performanceScore: 76, cost: 2.6 },
      { name: "cache-db-replica", engine: "MySQL", performanceScore: 95, cost: 0.7 },
    ];
    const rds = await Resource.insertMany(
      rdsData.map((r, i) => ({
        user: user._id,
        type: "RDS",
        name: r.name,
        resourceId: `db-instance-${i}`,
        region: "ap-south-1",
        status: "running",
        engine: r.engine,
        performanceScore: r.performanceScore,
        cost: r.cost,
      }))
    );

    // ---------- IAM ----------
    const iamData = [
      { name: "anmol-admin", mfaEnabled: true, roles: ["Administrator"] },
      { name: "devops-user", mfaEnabled: true, roles: ["DevOps", "EC2FullAccess"] },
      { name: "readonly-user", mfaEnabled: false, roles: ["ReadOnlyAccess"] },
      { name: "ci-cd-bot", mfaEnabled: false, roles: ["S3FullAccess", "ECRPush"] },
      { name: "billing-viewer", mfaEnabled: true, roles: ["BillingReadOnly"] },
    ];
    const iam = await Resource.insertMany(
      iamData.map((u, i) => ({
        user: user._id,
        type: "IAM",
        name: u.name,
        resourceId: `iam-user-${i}`,
        region: "global",
        status: "active",
        mfaEnabled: u.mfaEnabled,
        roles: u.roles,
        lastActive: new Date(Date.now() - i * 86400000),
        cost: 0,
      }))
    );

    // ---------- Costs (last 8 days matching reference: Jul 4 - Jul 11 pattern) ----------
    const dailyTotals = [40, 45, 38, 41, 47, 36, 39, 43.28];
    const costs = [];
    const today = new Date();
    dailyTotals.forEach((total, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (dailyTotals.length - 1 - i));
      const split = {
        EC2: total * 0.426,
        S3: total * 0.284,
        RDS: total * 0.18,
        IAM: 0,
        Others: total * 0.11,
      };
      Object.entries(split).forEach(([service, amount]) => {
        if (amount > 0) costs.push({ user: user._id, service, amount: Number(amount.toFixed(2)), date });
      });
    });
    await Cost.insertMany(costs);

    // ---------- Recommendations ----------
    await Recommendation.insertMany([
      {
        user: user._id,
        resource: "worker-node-01, test-instance",
        issue: "2 EC2 instances stopped but not terminated",
        saving: 15.2,
        action: "Stop 2 Unused EC2 Instances",
        category: "EC2",
      },
      {
        user: user._id,
        resource: "3 unattached EBS volumes",
        issue: "Unused EBS volumes incurring storage cost",
        saving: 4.5,
        action: "Delete 3 Unused EBS Volumes",
        category: "EC2",
      },
      {
        user: user._id,
        resource: "old-backup-bucket, archive-bucket",
        issue: "Infrequently accessed data on Standard storage",
        saving: 3.1,
        action: "Move data to S3 Glacier via Lifecycle Policy",
        category: "S3",
      },
      {
        user: user._id,
        resource: "cache-db-replica",
        issue: "RDS instance oversized for current load",
        saving: 2.2,
        action: "Downsize RDS instance class",
        category: "RDS",
      },
      {
        user: user._id,
        resource: "readonly-user, ci-cd-bot",
        issue: "IAM users without MFA enabled",
        saving: 0,
        action: "Enforce MFA on all IAM users",
        category: "IAM",
      },
    ]);

    // ---------- Alerts ----------
    await Alert.insertMany([
      {
        user: user._id,
        type: "High EC2 CPU Utilization",
        message: `Instance ${ec2[4].resourceId} CPU usage above 90%`,
        severity: "critical",
        resource: ec2[4].name,
      },
      {
        user: user._id,
        type: "S3 Bucket Unused",
        message: "Bucket old-backup-bucket not accessed in 90 days",
        severity: "warning",
        resource: "old-backup-bucket",
      },
      {
        user: user._id,
        type: "RDS Backup Completed",
        message: "Database cloudwise-db backup completed successfully",
        severity: "info",
        resource: "cloudwise-db",
      },
      {
        user: user._id,
        type: "IAM MFA Disabled",
        message: "User readonly-user does not have MFA enabled",
        severity: "warning",
        resource: "readonly-user",
      },
    ]);

    // ---------- Activities ----------
    await Activity.insertMany([
      { user: user._id, action: "EC2 Instance Started", resource: ec2[0].resourceId, time: new Date() },
      { user: user._id, action: "S3 Bucket Created", resource: "cloudwise-logs-bucket", time: new Date(Date.now() - 2 * 60000) },
      { user: user._id, action: "IAM User Added", resource: "devops-user", time: new Date(Date.now() - 5 * 60000) },
      { user: user._id, action: "RDS Backup Completed", resource: "cloudwise-db", time: new Date(Date.now() - 3 * 3600000) },
      { user: user._id, action: "EC2 Instance Stopped", resource: "worker-node-01", time: new Date(Date.now() - 6 * 3600000) },
      { user: user._id, action: "S3 Lifecycle Policy Updated", resource: "archive-bucket", time: new Date(Date.now() - 9 * 3600000) },
    ]);

    console.log("✅ Seed data created successfully!");
    console.log("Login with: demo@cloudwise.com / demo1234");
    process.exit();
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

run();
