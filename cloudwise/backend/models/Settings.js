import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    theme: { type: String, enum: ["dark", "light"], default: "dark" },
    notifications: {
      email: { type: Boolean, default: true },
      alerts: { type: Boolean, default: true },
    },
    language: { type: String, default: "en" },
    timezone: { type: String, default: "Asia/Kolkata" },
    currency: { type: String, default: "USD" },
    budgetLimit: { type: Number, default: 200, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);