import Quiz from "../models/Quiz.js";
import QuizQuestion from "../models/QuizQuestion.js";
import QuizAuditLog from "../models/QuizAuditLog.js";

const fail = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });

export const createQuizService = async (payload, adminId) => {
  const { title, description = "", startsAt, endsAt } = payload || {};
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (!title?.trim() || !Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
    throw fail("Title, valid startsAt and valid endsAt are required");
  }
  if (end <= start) throw fail("endsAt must be later than startsAt");
  if (start <= new Date()) throw fail("Scheduled start must be in the future");
  const quiz = await Quiz.create({
    title: title.trim(), description, startsAt: start, endsAt: end,
    status: "SCHEDULED", createdBy: adminId,
  });
  await QuizAuditLog.create({ quizId: quiz._id, actor: "ADMIN", event: "QUIZ_CREATED", metadata: { title: quiz.title } });
  return quiz;
};

export const addQuestionService = async (quizId, payload) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw fail("Quiz not found", 404);
  if (["OPEN", "CLOSED", "RESULTS_PUBLISHED"].includes(quiz.status)) throw fail("Questions cannot be changed after the quiz opens", 409);
  const { prompt, options, correctOptionId } = payload || {};
  if (!prompt?.trim() || !Array.isArray(options) || options.length !== 4) throw fail("A prompt and exactly four options are required");
  const ids = options.map((o) => o?.optionId);
  if (new Set(ids).size !== 4 || ids.some((id) => !["A", "B", "C", "D"].includes(id))) throw fail("Option IDs must be unique A, B, C and D");
  if (options.some((o) => typeof o.text !== "string" || !o.text.trim())) throw fail("Every option needs text");
  if (!ids.includes(correctOptionId)) throw fail("correctOptionId must match one of the four options");
  const question = await QuizQuestion.create({
    quizId, prompt: prompt.trim(),
    options: options.map((o) => ({ optionId: o.optionId, text: o.text.trim() })),
    correctOptionId, marks: 1,
  });
  await QuizAuditLog.create({ quizId, actor: "ADMIN", event: "QUESTION_CREATED", metadata: { questionId: question._id } });
  return question;
};

export const listQuizQuestionsService = async (quizId) => {
  const quiz = await Quiz.findById(quizId).lean();
  if (!quiz) throw fail("Quiz not found", 404);
  const questions = await QuizQuestion.find({ quizId, isActive: true })
    .select("+correctOptionId").lean();
  return {
    quiz,
    totalQuestions: questions.length,
    questions: questions.map(({ correctOptionId, ...q }) => ({ ...q, correctOptionId })),
  };
};

export const publishQuizService = async (quizId, adminId) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw fail("Quiz not found", 404);
  if (quiz.status !== "SCHEDULED") throw fail("Only a scheduled quiz can be activated", 409);
  const count = await QuizQuestion.countDocuments({ quizId, isActive: true });
  if (count !== 30) throw fail(`Exactly 30 active questions are required; currently found ${count}`, 409);
  quiz.status = "OPEN";
  await quiz.save();
  await QuizAuditLog.create({ quizId, actor: "ADMIN", event: "QUIZ_OPENED", metadata: { adminId } });
  return quiz;
};

export const listQuizzesService = () => Quiz.find().sort({ createdAt: -1 }).lean();
