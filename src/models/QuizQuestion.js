import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  optionId: { type: String, required: true },
  text: { type: String, required: true, trim: true, maxlength: 1000 },
}, { _id: false });

const questionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true, index: true },
  prompt: { type: String, required: true, trim: true, maxlength: 3000 },
  options: {
    type: [optionSchema],
    validate: {
      validator: (items) => items.length === 4 && new Set(items.map((x) => x.optionId)).size === 4,
      message: "Each MCQ must contain exactly four uniquely identified options",
    },
    required: true,
  },
  correctOptionId: { type: String, required: true, select: false },
  marks: { type: Number, default: 1, immutable: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

questionSchema.index({ quizId: 1, isActive: 1 });

export default mongoose.model("QuizQuestion", questionSchema);
