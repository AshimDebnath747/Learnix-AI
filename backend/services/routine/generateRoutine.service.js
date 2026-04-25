import { db } from "../../config/db.js";
import AppError from "../../utils/appError.js";
import { eq } from "drizzle-orm";
import { plans } from "../../model/routineSchema.js";
export const generateRoutineLogic = async ({ userId, semester, daysLeft }) => {
    // 1. Fetch questions
    const { data: questions, error } = await db
        .select()
        .from(questions)
        .where(eq(questions.semester, semester));

    if (error) throw error;

    if (!questions || questions.length === 0) {
        throw new AppError("No questions found");
    }

    // 2. Assign weights
    const weightMap = { 12: 4, 6: 3, 4: 2, 2: 1 };

    const weighted = questions.map(q => ({
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

        // if limit reached → push day
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
            question_id: q.question_id,
            module_id: q.module_id,
            marks: q.marks
        });

        currentWeight += q.weight;
    }

    // push last day
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
        const currentDay = i + 1;

        finalPlan.push(plan[i]);

        if (currentDay % 7 === 0) {
            const prevTasks = finalPlan
                .slice(Math.max(0, i - 6), i + 1)
                .flatMap(d => d.tasks.map(t => t.question_id));

            finalPlan.push({
                day: currentDay + 0.5, // optional (or shift days)
                type: "revision",
                tasks: prevTasks.slice(0, 10) // limit
            });
        }
    }

    // 7. Save plan (JSONB)
    const { data: savedPlan, error: saveError } = await db.insert(plans).values({
        userId,
        semester,
        plan: finalPlan
    }).returning();

    if (saveError) throw saveError;

    return {
        message: "Routine generate successfully!",
        routine: savedPlan
    }
}