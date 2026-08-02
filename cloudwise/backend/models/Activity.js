import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    time: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Activity", activitySchema);
