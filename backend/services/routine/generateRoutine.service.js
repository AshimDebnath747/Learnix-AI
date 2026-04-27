import { db } from "../../config/db.js";
import AppError from "../../utils/appError.js";
import { eq } from "drizzle-orm";
import { plans } from "../../model/routineSchema.js";
import { questions } from "../../model/questionsSchema.js";

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

        if (currentWeight + q.weight > dailyTarget) {
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
            marks: q.marks
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
            const prevTasks = finalPlan
                .slice(Math.max(0, i - 6), i + 1)
                .flatMap(d => d.tasks.map(t => typeof t === 'object' ? t.question_id : t));

            finalPlan.push({
                day: plan[i].day + 0.5,
                type: "revision",
                tasks: prevTasks.slice(0, 10)
            });
        }
    }

    // 7. Save plan
    const savedPlan = await db.insert(plans).values({
        userId,
        semester,
        plan: finalPlan
    }).returning();

    return {
        message: "Routine generated successfully!",
        routine: savedPlan
    }
}