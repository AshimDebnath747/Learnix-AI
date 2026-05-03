import {
  completeQuestion,
  getQuestionProgress,
  getUserProgress
} from "../../services/progress/completeQuestion.service.js";

/**
 * POST /progress/complete
 * Mark a question as completed and track progress
 *
 * Request body:
 * {
 *   "userId": "uuid",
 *   "questionId": "string"
 * }
 */
export const markQuestionComplete = async (req, res) => {
  const result = await completeQuestion(req.validated);

  return res.status(200).json({
    success: true,
    message: result.message,
    data: result.data
  });
};

/**
 * GET /progress/question/:userId/:questionId
 * Get progress for a specific question
 */
export const getProgress = async (req, res) => {
  const { userId, questionId } = req.params;

  const result = await getQuestionProgress({ userId, questionId });

  return res.status(200).json({
    success: result.success,
    message: result.message,
    data: result.data
  });
};

/**
 * GET /progress/user/:userId
 * Get all progress for a user
 */
export const getUserProgressController = async (req, res) => {
  const { userId } = req.params;

  const result = await getUserProgress({ userId });

  return res.status(200).json({
    success: result.success,
    message: result.message,
    data: result.data,
    count: result.count
  });
};
