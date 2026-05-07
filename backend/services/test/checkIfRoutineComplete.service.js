import { db } from "../../config/db.js";
import { userProgress } from "../../model/userProgressSchema.js";
import { routineQuestions } from "../../model/routineQuestionsSchema.js";
import { eq, count, and } from "drizzle-orm";
export const checkIfRoutineCompleted = async (userId, planId) => {
    const total = await db
        .select({ count: count() })
        .from(routineQuestions)
        .where(eq(routineQuestions.planId, planId))

    const completed = await db
        .select({ count: count() })
        .from(userProgress)
        .innerJoin(
            routineQuestions,
            eq(userProgress.questionId, routineQuestions.questionId)
        )
        .where(
            and(
                eq(userProgress.userId, userId),
                eq(routineQuestions.planId, planId),
                eq(userProgress.completed, true)
            )
        )

    if (completed[0].count !== total[0].count) {
        throw new Error("Routine not fully completed")
    }
}