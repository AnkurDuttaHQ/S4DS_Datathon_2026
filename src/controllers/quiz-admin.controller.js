import {
  createQuizService, addQuestionService, listQuizQuestionsService,
  publishQuizService, listQuizzesService,
} from "../services/quiz-admin.service.js";

const sendError = (res, error) => res.status(error.statusCode || 500).json({
  success: false, message: error.message || "Quiz operation failed",
});

export const createQuiz = async (req, res) => {
  try {
    const quiz = await createQuizService(req.body, req.admin.adminId);
    return res.status(201).json({ success: true, data: quiz });
  } catch (error) { return sendError(res, error); }
};

export const addQuizQuestion = async (req, res) => {
  try {
    const question = await addQuestionService(req.params.quizId, req.body);
    return res.status(201).json({ success: true, data: question });
  } catch (error) { return sendError(res, error); }
};

export const getQuizQuestions = async (req, res) => {
  try {
    const data = await listQuizQuestionsService(req.params.quizId);
    return res.status(200).json({ success: true, data });
  } catch (error) { return sendError(res, error); }
};

export const activateQuiz = async (req, res) => {
  try {
    const quiz = await publishQuizService(req.params.quizId, req.admin.adminId);
    return res.status(200).json({ success: true, message: "Quiz activated", data: quiz });
  } catch (error) { return sendError(res, error); }
};

export const getQuizzes = async (_req, res) => {
  try {
    const quizzes = await listQuizzesService();
    return res.status(200).json({ success: true, data: quizzes });
  } catch (error) { return sendError(res, error); }
};
