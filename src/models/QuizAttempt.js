import mongoose from "mongoose";

const snapshotItemSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "QuizQuestion", required: true },
  optionOrder: { type: [String], required: true },
}, { _id: false });

const attemptSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  registrationId: { type: mongoose.Schema.Types.ObjectId, ref: "Registration", required: true },
  teamName: { type: String, required: true },
  leaderEmail: { type: String, required: true, lowercase: true },
  status: { type: String, enum: ["IN_PROGRESS", "SUBMITTED", "AUTO_SUBMITTED"], default: "IN_PROGRESS", index: true },
  startedAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  submittedAt: { type: Date, default: null },
  questionSnapshot: { type: [snapshotItemSchema], required: true },
  score: { type: Number, default: null },
  answeredCount: { type: Number, default: 0 },
}, { timestamps: true });

attemptSchema.index({ quizId: 1, registrationId: 1 }, { unique: true });
attemptSchema.index({ status: 1, expiresAt: 1 });

export default mongoose.model("QuizAttempt", attemptSchema);
