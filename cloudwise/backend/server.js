import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import costRoutes from "./routes/costRoutes.js";
import optimizationRoutes from "./routes/optimizationRoutes.js";
import monitoringRoutes from "./routes/monitoringRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) => res.json({ message: "CloudWise API running" }));

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api", resourceRoutes); // /api/ec2, /api/s3, /api/rds, /api/iam
app.use("/api", costRoutes); // /api/cost-analysis
app.use("/api", optimizationRoutes); // /api/recommendations
app.use("/api", monitoringRoutes); // /api/system-health
app.use("/api/alerts", alertRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/settings", settingsRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`CloudWise API running on port ${PORT}`));