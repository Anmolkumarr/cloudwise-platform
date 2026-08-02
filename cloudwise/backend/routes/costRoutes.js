import express from "express";
import { getCostAnalysis } from "../controllers/costController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.get("/cost-analysis", protect, getCostAnalysis);

export default router;
