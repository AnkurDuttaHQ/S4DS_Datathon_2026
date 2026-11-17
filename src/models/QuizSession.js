import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  registrationId: { type: mongoose.Schema.Types.ObjectId, ref: "Registration", required: true },
  leaderEmail: { type: String, required: true, lowercase: true },
  sessionId: { type: String, required: true, unique: true },
  status: { type: String, enum: ["ACTIVE", "REVOKED"], default: "ACTIVE" },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

sessionSchema.index(\n  { quizId: 1, registrationId: 1 },\n  { unique: true, partialFilterExpression: { status: "ACTIVE" } }\n);
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("QuizSession", sessionSchema);
