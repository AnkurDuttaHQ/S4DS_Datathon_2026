import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  status: {
    type: String,
    enum: ["DRAFT", "SCHEDULED", "OPEN", "CLOSED", "RESULTS_PUBLISHED"],
    default: "DRAFT",
    index: true,
  },
  startsAt: { type: Date, required: true },
  endsAt: { type: Date, required: true },
  durationMinutes: { type: Number, default: 30, immutable: true },
  questionCount: { type: Number, default: 30, immutable: true },
  marksPerCorrect: { type: Number, default: 1, immutable: true },
  marksPerIncorrect: { type: Number, default: 0, immutable: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  resultsPublishedAt: { type: Date, default: null },
}, { timestamps: true });

quizSchema.pre("validate", function () {
  if (this.endsAt <= this.startsAt) this.invalidate("endsAt", "Quiz end must be after quiz start");
  if (this.durationMinutes !== 30 || this.questionCount !== 30) {
    this.invalidate("durationMinutes", "First-round configuration is fixed at 30 minutes and 30 questions");
  }
});

export default mongoose.model("Quiz", quizSchema);
