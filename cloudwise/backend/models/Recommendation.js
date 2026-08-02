import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resource: { type: String, required: true },
    issue: { type: String, required: true },
    saving: { type: Number, required: true },
    action: { type: String, required: true },
    category: { type: String, enum: ["EC2", "S3", "RDS", "IAM"], required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Recommendation", recommendationSchema);
