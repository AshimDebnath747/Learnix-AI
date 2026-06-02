import { db } from "../../config/db.js"
import { eq, count, and } from "drizzle-orm";
import { users } from "../../model/userschema.js";
import { plans } from "../../model/routineSchema.js";
import { routineQuestions } from "../../model/routineQuestionsSchema.js";
import { userProgress } from "../../model/userProgressSchema.js";
import { tests } from "../../model/testsSchema.js";
import { testMcqs } from "../../model/testMcqsSchema.js";
export const getUserProfileService = async (userId) => {
    const user = await db
        .select({
            id: users.id,
            username: users.username,
            email: users.email,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
    console.log("user:", user)
    if (!user.length) {
        throw new Error("User not found!")
    }
    return user
}

export const getUserProgressService = async (userId) => {
    //the the active plan id with the user id
    const plan = await db
        .select({
            id: plans.id,
            semester: plans.semester,
        })
        .from(plans)
        .where(eq(plans.userId, userId))
    console.log(plan)

    //get all the questions user the same plan id
    const planId = plan[0].id
    console.log(planId)
    const [{ totalQuestions }] = await db
        .select({
            totalQuestions: count(routineQuestions.id)
        })
        .from(routineQuestions)
        .where(eq(routineQuestions.planId, planId))

    //get all completed questions
    const [{ completedQuestions }] = await db
        .select({
            completedQuestions: count(userProgress.id)
        })
        .from(userProgress)
        .where(eq(userProgress.userId, userId))

    return {
        total: totalQuestions,
        complete: completedQuestions
    }
}

export const getRecentTestsService = async (userId) => {
    const testIds = await db
        .select({
            id: tests.id
        })
        .from(tests)
        .where(eq(tests.userId, userId))
    console.log("tests:", testIds)
    if (!testIds.length) {
        throw new Error("No tests found")
    }
    let results = []
    for (let testId of testIds) {
        console.log(testId.id)
        const [{ totalMcqs }] = await db
            .select({
                totalMcqs: count(testMcqs.id)
            })
            .from(testMcqs)
            .where(eq(testMcqs.testId, testId.id))
        const [{ correct }] = await db
            .select({
                totalMcqs: count(testMcqs.id)
            })
            .from(testMcqs)
            .where(
                and(
                    eq(testMcqs.testId, testId.id),
                    eq(testMcqs.isCorrect, 1)
                )
            )

        results.push({ totalMcqs: totalMcqs, correct: correct ? correct : 0 })

    }
    return { testIds, results }

}