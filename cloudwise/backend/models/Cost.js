import mongoose from "mongoose";

const costSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    service: { type: String, enum: ["EC2", "S3", "RDS", "IAM", "Others"], required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Cost", costSchema);
