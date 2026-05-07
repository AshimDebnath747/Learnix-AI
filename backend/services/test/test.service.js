import { db } from "../../config/db.js"
import { tests } from "../../model/testsSchema.js"
import { questions } from "../../model/questionsSchema.js"
import { routineQuestions } from "../../model/routineQuestionsSchema.js"
import { mcqQuestions } from "../../model/mcqQuestionsSchema.js"
import { eq, and, sql, inArray } from "drizzle-orm"
import { testMcqs } from "../../model/testMcqsSchema.js"
import { userProgress } from "../../model/userProgressSchema.js"
import { checkIfRoutineCompleted } from "./checkIfRoutineComplete.service.js"

export const createTestService = async (userId, limit = 20) => {

    // 1. get completed topics (no full completion check)
    return await db.transaction(async (tx) => {
        const completedWithTopics = await tx
            .select({
                topic: questions.topic
            })
            .from(userProgress)
            .innerJoin(
                questions,
                eq(userProgress.questionId, questions.questionId)
            )
            .where(
                and(
                    eq(userProgress.userId, userId),
                    eq(userProgress.completed, true)
                )
            )

        if (!completedWithTopics.length) {
            throw new Error("No completed topics found")
        }

        // 2. extract unique topics
        const topics = [...new Set(completedWithTopics.map(q => q.topic))]

        // 3. fetch MCQs based on topics
        const mcqs = await tx
            .select()
            .from(mcqQuestions)
            .where(inArray(mcqQuestions.topic, topics))
            .orderBy(sql`RANDOM()`)
            .limit(25);

        if (!mcqs.length) {
            throw new Error("No MCQs found for completed topics")
        }


        // 5. create test (type = practice)
        const [test] = await tx.insert(tests)
            .values({
                user_id: userId,
                type: "practice"
            })
            .returning()

        // 6. map MCQs
        await tx.insert(testMcqs).values(
            mcqs.map(q => ({
                testId: test.id,
                mcqId: q.id
            }))
        )
        const safeMcqs = mcqs.map(({ correctOption, ...rest }) => rest);
        return {
            testId: test.id,
            totalQuestions: selected.length,
            safeMcqs: safeMcqs
        }
    })
}

export const getTestService = async (userId) => {
    const test = await db
        .select()
        .from(tests)
        .where(eq(tests.userId, userId))

    return test
}

export const submitAnswerService = async ({ testId, mcqId, selectedOption }) => {
    const mcq = await db.query.mcq_questions.findFirst({
        where: { id: mcqId }
    })

    const isCorrect = mcq.correct_option === selectedOption

    await db.insert(user_answers).values({
        test_id: testId,
        mcq_id: mcqId,
        selected_option: selectedOption,
        is_correct: isCorrect
    })

    return { isCorrect }
}

export const getResultService = async (testId) => {
    const answers = await db.query.user_answers.findMany({
        where: { test_id: testId }
    })

    const total = answers.length
    const correct = answers.filter(a => a.is_correct).length

    return {
        total,
        correct,
        score: (correct / total) * 100
    }
}

// services/test.service.js

export const createFinalTestService = async (userId, planId) => {

    // 1. prevent duplicate final test
    return await db.transaction(async (tx) => {
        const existing = await tx
            .select()
            .from(tests)
            .where(
                and(
                    eq(tests.userId, userId),
                    eq(tests.planId, planId),
                    eq(tests.type, "final")
                )
            )
            .limit(1);

        if (existing.length) {
            return { testId: existing[0].id, message: "Test already Exists" };
        }

        // 2. check completion[omitted for now 06 /05 / 26]
        const isCompleted = await checkIfRoutineCompleted(userId, planId)

        if (!isCompleted) {
            throw new Error("Routine not fully completed")
        }

        //3. get all topics from plan
        const topicsData = await tx
            .select({ topic: questions.topic })
            .from(routineQuestions)
            .innerJoin(
                questions,
                eq(routineQuestions.questionId, questions.questionId)
            )
            .where(eq(routineQuestions.planId, planId))

        const topics = [...new Set(topicsData.map(t => t.topic))]

        // 4. fetch MCQs
        const mcqs = await tx
            .select()
            .from(mcqQuestions)
            .where(inArray(mcqQuestions.topic, topics))
            .orderBy(sql`RANDOM()`)
            .limit(25);

        // 5. randomize + limit
        console.log("mcqs", mcqs)
        // 6. create test
        const [test] = await tx.insert(tests)
            .values({
                userId: userId,
                planId: planId,
                type: "final"
            })
            .returning()

        // 7. map MCQs
        await tx.insert(testMcqs).values(
            mcqs.map(q => ({
                testId: test.id,
                mcqId: q.id
            }))
        )
        const safeMcqs = mcqs.map(({ correctOption, ...rest }) => rest);
        return {
            testId: test.id,
            totalQuestions: safeMcqs.length,
            safeMcqs: safeMcqs
        }
    })
}