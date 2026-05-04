import { db } from "../../config/db.js";
import { routineQuestions } from "../../model/routineQuestionsSchema.js";

/**
 * Parse the generated plan and insert all questions into routine_questions table
 * @param {Object} plan - The generated plan (JSONB from database)
 * @param {string} planId - The plan ID
 * @param {string} userId - The user ID
 */
export const parseAndSaveRoutineQuestions = async (plan, planId, userId) => {
    try {
        // Flatten all tasks from all days
        const allTasks = [];

        plan.forEach(dayPlan => {
            const dayNo = dayPlan.day;
            
            if (dayPlan.tasks && dayPlan.tasks.length > 0) {
                dayPlan.tasks.forEach(task => {
                    allTasks.push({
                        userId,
                        questionId: task.question_id,  // Store text question_id (e.g., "ES-103_51")
                        dayNo,
                        planId
                    });
                });
            }
        });

        // Bulk insert all tasks
        if (allTasks.length > 0) {
            await db.insert(routineQuestions).values(allTasks);
            console.log(`✅ Inserted ${allTasks.length} questions into routine_questions`);
        }

        return allTasks.length;
    } catch (error) {
        console.error("❌ Error saving routine questions:", error);
        throw error;
    }
};
