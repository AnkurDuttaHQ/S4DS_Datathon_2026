import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createQuiz, addQuizQuestion, getQuizQuestions, activateQuiz, getQuizzes,
} from "../controllers/quiz-admin.controller.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/", getQuizzes);
router.post("/", createQuiz);
router.post("/:quizId/questions", addQuizQuestion);
router.get("/:quizId/questions", getQuizQuestions);
router.post("/:quizId/activate", activateQuiz);

export default router;
