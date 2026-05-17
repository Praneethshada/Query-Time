import express from "express";
import {
  getQuestionsForClass,
  createQuestion,
  updateQuestionStatus,
  clearQuestionsForClass,
  updateQuestionAnswer,
} from "../controllers/questionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/:classId")
  .get(protect, getQuestionsForClass)
  .post(protect, createQuestion);
router.route("/:questionId/status").patch(protect, updateQuestionStatus);
router.route("/:questionId/answer").patch(protect, updateQuestionAnswer);
router.route("/:classId/clear").delete(protect, clearQuestionsForClass);

export default router;
