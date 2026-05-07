import { db } from "../../config/db.js";
import { userProgress } from "../../model/userProgressSchema.js";
import AppError from "../../utils/appError.js";
import { eq, and, sql } from "drizzle-orm";


export const completeQuestion = async ({ userId, questionId }) => {
  // Validate inputs
  if (!userId || !questionId) {
    throw new AppError("userId and questionId are required", 400);
  }

  try {
    // DRIZZLE ORM UPSERT using onConflictDoUpdate
    const result = await db
      .insert(userProgress)
      .values({
        userId,
        questionId,
        completed: true,
        completedAt: sql`NOW()`
      })
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.questionId],
        set: {
          completed: true,
          completedAt: sql`NOW()`
        }
      })
      .returning();

    if (!result || result.length === 0) {
      throw new AppError("Failed to record progress", 500);
    }

    return {
      success: true,
      message: "Progress recorded successfully",
      data: {
        progressId: result[0].id,
        userId: result[0].userId,
        questionId: result[0].questionId,
        completed: result[0].completed,
        completedAt: result[0].completedAt
      }
    };
  } catch (error) {
    // Handle unique constraint violation gracefully
    if (error.code === "23505") {
      throw new AppError("Progress for this question already exists", 409);
    }

    // Re-throw AppError, otherwise wrap in AppError
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      error.message || "Failed to record progress",
      error.statusCode || 500
    );
  }
};

/**
 * Get user's progress for a specific question
 */
export const getQuestionProgress = async ({ userId, questionId }) => {
  if (!userId || !questionId) {
    throw new AppError("userId and questionId are required", 400);
  }

  try {
    const result = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.questionId, questionId)
        )
      )
      .limit(1);

    if (!result || result.length === 0) {
      return {
        success: true,
        data: null,
        message: "No progress found for this question"
      };
    }

    return {
      success: true,
      data: result[0],
      message: "Progress retrieved successfully"
    };
  } catch (error) {
    console.error("Error retrieving progress:", error);
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      error.message || "Failed to retrieve progress",
      error.statusCode || 500
    );
  }
};

/**
 * Get all progress for a user
 */
export const getUserProgress = async ({ userId }) => {
  if (!userId) {
    throw new AppError("userId is required", 400);
  }

  try {
    const result = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));

    return {
      success: true,
      data: result,
      message: "User progress retrieved successfully",
      count: result.length
    };
  } catch (error) {
    
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      error.message || "Failed to retrieve user progress",
      error.statusCode || 500
    );
  }
};
