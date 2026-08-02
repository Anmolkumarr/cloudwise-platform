import express from "express";
import { getEC2, getS3, getRDS, getIAM, createEC2, createS3, createRDS, createIAM, toggleEC2Status, deleteEC2, toggleRDSStatus, deleteRDS, deleteS3, deleteIAM } from "../controllers/resourceController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/ec2", protect, getEC2);
router.post("/ec2", protect, createEC2);
router.put("/ec2/:id/toggle", protect, toggleEC2Status);
router.delete("/ec2/:id", protect, deleteEC2);

router.get("/s3", protect, getS3);
router.post("/s3", protect, createS3);
router.delete("/s3/:id", protect, deleteS3);

router.get("/rds", protect, getRDS);
router.post("/rds", protect, createRDS);
router.put("/rds/:id/toggle", protect, toggleRDSStatus);
router.delete("/rds/:id", protect, deleteRDS);

router.get("/iam", protect, getIAM);
router.post("/iam", protect, createIAM);
router.delete("/iam/:id", protect, deleteIAM);

export default router;