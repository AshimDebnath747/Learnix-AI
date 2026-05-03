import { db } from "../../config/db.js";
import AppError from "../../utils/appError.js";
import { eq } from "drizzle-orm";
import { plans } from "../../model/routineSchema.js";
import { questions } from "../../model/questionsSchema.js";
import { routineQuestions } from "../../model/routineQuestionsSchema.js";

export const generateRoutineLogic = async ({ userId, semester, daysLeft }) => {
    // 1. Fetch questions
    const questionsData = await db
        .select()
        .from(questions)
        .where(eq(questions.semester, semester));

    if (!questionsData || questionsData.length === 0) {
        throw new AppError("No questions found");
    }

    // 2. Assign weights
    const weightMap = { 12: 4, 6: 3, 4: 2, 2: 1 };

    const weighted = questionsData.map(q => ({
        ...q,
        weight: weightMap[q.marks] || 1
    }));

    // 3. Sort (high value first)
    weighted.sort((a, b) => b.weight - a.weight);

    // 4. Calculate daily target
    const totalWeight = weighted.reduce((sum, q) => sum + q.weight, 0);
    const dailyTarget = Math.ceil(totalWeight / daysLeft);

    // 5. Build routine
    let plan = [];
    let day = 1;
    let currentWeight = 0;
    let tasks = [];

    for (let i = 0; i < weighted.length; i++) {
        const q = weighted[i];

        // Only create new day if: weight exceeds daily target AND we haven't reached daysLeft limit
        if (currentWeight + q.weight > dailyTarget && day < daysLeft) {
            plan.push({
                day,
                type: "study",
                tasks
            });

            day++;
            currentWeight = 0;
            tasks = [];
        }

        tasks.push({
            question_id: q.questionId,
            module_id: q.moduleId,
            marks: q.marks,
            subject_code: q.subjectCode
        });

        currentWeight += q.weight;
    }

    if (tasks.length > 0) {
        plan.push({
            day,
            type: "study",
            tasks
        });
    }

    // 6. Add revision days (every 7th day)
    let finalPlan = [];

    for (let i = 0; i < plan.length; i++) {
        finalPlan.push(plan[i]);

        if ((i + 1) % 7 === 0) {
            // Extract full task objects from previous 6 days, not just IDs
            const prevTasks = finalPlan
                .slice(Math.max(0, i - 6), i + 1)
                .flatMap(d => d.tasks)
                .slice(0, 10);

            finalPlan.push({
                day: plan[i].day + 0.5,
                type: "revision",
                tasks: prevTasks
            });
        }
    }

    // 7-8. TRANSACTION: Insert plan and routine_questions atomically
    // If either operation fails, both are rolled back
    console.log("Starting transaction with finalPlan:", finalPlan.length, "days");
    
    try {
        const result = await db.transaction(async (tx) => {
            // Save plan
            console.log("Inserting plan...");
            const savedPlan = await tx.insert(plans).values({
                userId,
                semester,
                plan: finalPlan
            }).returning();

            console.log("Plan saved:", savedPlan[0]?.id);
            const planId = savedPlan[0].id;

            // Parse and save all questions from the plan
            const allTasks = [];

            finalPlan.forEach(dayPlan => {
                const dayNo = dayPlan.day;
                
                if (dayPlan.tasks && dayPlan.tasks.length > 0) {
                    dayPlan.tasks.forEach(task => {
                        allTasks.push({
                            userId,
                            questionId: task.question_id,
                            dayNo,
                            planId
                        });
                    });
                }
            });

            console.log("Total tasks to insert:", allTasks.length);

            // Bulk insert all tasks
            let questionsInserted = 0;
            if (allTasks.length > 0) {
                console.log("Inserting routine questions...");
                await tx.insert(routineQuestions).values(allTasks);
                questionsInserted = allTasks.length;
                console.log(`✅ Inserted ${questionsInserted} questions into routine_questions`);
            }

            return {
                savedPlan: savedPlan[0],
                questionsInserted
            };
        });

        console.log("Transaction completed successfully");

        return {
            message: "Routine generated successfully!",
            routine: result.savedPlan,
            questionsInserted: result.questionsInserted
        };
    } catch (error) {
        console.error("❌ Transaction failed with error:", error.message);
        console.error("Full error details:", error);
        throw error;
    }
}