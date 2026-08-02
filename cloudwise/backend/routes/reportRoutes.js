import express from "express";
import { getReports, downloadCSV, downloadPDF } from "../controllers/reportController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getReports);
router.get("/csv", protect, downloadCSV);
router.get("/pdf", protect, downloadPDF);

export default router;