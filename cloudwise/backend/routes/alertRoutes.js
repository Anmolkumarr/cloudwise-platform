import express from "express";
import { getAlerts, resolveAlert } from "../controllers/alertController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.get("/", protect, getAlerts);
router.put("/:id/resolve", protect, resolveAlert);

export default router;
