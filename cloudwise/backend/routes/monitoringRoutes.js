import express from "express";
import { getSystemHealth } from "../controllers/monitoringController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.get("/system-health", protect, getSystemHealth);

export default router;
