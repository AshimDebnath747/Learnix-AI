import express from "express";
import {
  markQuestionComplete,
  getProgress,
  getUserProgressController
} from "../../controllers/progress/completeQuestion.controller.js";
import { validate } from "../../middlewares/zodvalidation.js";
import { completeQuestionSchema } from "../../validators/progress.validator.js";
import wrapRoutes from "../../utils/wrapRoutes.js";

const router = express.Router();

/**
 * POST /api/progress/complete
 * Mark a question as completed
 */
router.post("/complete", validate(completeQuestionSchema), markQuestionComplete);

/**
 * GET /api/progress/question/:userId/:questionId
 * Get progress for a specific question
 */
router.get("/question/:userId/:questionId", getProgress);

/**
 * GET /api/progress/user/:userId
 * Get all progress for a user
 */
router.get("/user/:userId", getUserProgressController);

export default wrapRoutes(router);
