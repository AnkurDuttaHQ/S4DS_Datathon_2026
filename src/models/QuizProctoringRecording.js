import mongoose from "mongoose";

const recordingSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true, index: true },
  registrationId: { type: mongoose.Schema.Types.ObjectId, ref: "Registration", required: true, index: true },
  attemptId: { type: mongoose.Schema.Types.ObjectId, ref: "QuizAttempt", required: true, index: true },
  sequence: { type: Number, required: true, min: 1 },
  cloudinaryPublicId: { type: String, required: true, unique: true },
  resourceType: { type: String, default: "video", enum: ["video"] },
  deliveryType: { type: String, default: "authenticated", enum: ["authenticated"] },
  format: { type: String, default: "webm" },
  mimeType: { type: String, required: true },
  bytes: { type: Number, required: true, min: 1 },
  durationMs: { type: Number, required: true, min: 1 },
  startedAt: { type: Date, required: true },
  endedAt: { type: Date, required: true },
  sha256: { type: String, default: null },
  status: { type: String, enum: ["UPLOADED", "DELETED"], default: "UPLOADED", index: true },
}, { timestamps: true });

recordingSchema.index({ attemptId: 1, sequence: 1 }, { unique: true });
recordingSchema.index({ quizId: 1, registrationId: 1, createdAt: -1 });

export default mongoose.model("QuizProctoringRecording", recordingSchema);
