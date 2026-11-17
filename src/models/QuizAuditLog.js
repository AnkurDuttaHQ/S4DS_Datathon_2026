import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", index: true },
  registrationId: { type: mongoose.Schema.Types.ObjectId, ref: "Registration", index: true },
  attemptId: { type: mongoose.Schema.Types.ObjectId, ref: "QuizAttempt", default: null },
  actor: { type: String, enum: ["ADMIN", "TEAM_LEADER", "SYSTEM"], required: true },
  event: { type: String, required: true, maxlength: 100 },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: { type: String, default: null },
  userAgent: { type: String, default: null },
}, { timestamps: true });

auditLogSchema.index({ quizId: 1, createdAt: -1 });

export default mongoose.model("QuizAuditLog", auditLogSchema);
