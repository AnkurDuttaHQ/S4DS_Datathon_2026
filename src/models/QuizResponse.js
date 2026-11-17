import mongoose from "mongoose";

const responseSchema = new mongoose.Schema({
  attemptId: { type: mongoose.Schema.Types.ObjectId, ref: "QuizAttempt", required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "QuizQuestion", required: true },
  selectedOptionId: { type: String, required: true },
  savedAt: { type: Date, default: Date.now },
}, { timestamps: true });

responseSchema.index({ attemptId: 1, questionId: 1 }, { unique: true });

export default mongoose.model("QuizResponse", responseSchema);
