import { db } from "../../config/db.js"
export const createTest = async (userId, limit = 20) => {

    // 1. get completed topics (no full completion check)
    const completedWithTopics = await db
        .select({
            topic: questions.topic
        })
        .from(user_progress)
        .innerJoin(
            questions,
            eq(user_progress.question_id, questions.question_id)
        )
        .where(
            and(
                eq(user_progress.user_id, userId),
                eq(user_progress.completed, true)
            )
        )

    if (!completedWithTopics.length) {
        throw new Error("No completed topics found")
    }

    // 2. extract unique topics
    const topics = [...new Set(completedWithTopics.map(q => q.topic))]

    // 3. fetch MCQs based on topics
    const mcqs = await db.query.mcq_questions.findMany({
        where: (mcq, { inArray }) => inArray(mcq.topic, topics)
    })

    if (!mcqs.length) {
        throw new Error("No MCQs found for completed topics")
    }

    // 4. randomize + limit
    const shuffled = mcqs.sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, limit)

    // 5. create test (type = practice)
    const [test] = await db.insert(tests)
        .values({
            user_id: userId,
            type: "practice"
        })
        .returning()

    // 6. map MCQs
    await db.insert(test_mcqs).values(
        selected.map(q => ({
            test_id: test.id,
            mcq_id: q.id
        }))
    )

    return {
        testId: test.id,
        totalQuestions: selected.length
    }
}

export const getTest = async (userId) => {
    const test = await db.query.tests.findFirst({
        where: { user_id: userId },
        with: {
            test_mcqs: {
                with: {
                    mcq: true
                }
            }
        }
    })

    return test
}

export const submitAnswer = async ({ testId, mcqId, selectedOption }) => {
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

export const getResult = async (testId) => {
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
    const existing = await db.query.tests.findFirst({
        where: (t, { and, eq }) =>
            and(
                eq(t.user_id, userId),
                eq(t.plan_id, planId),
                eq(t.type, "final")
            )
    })

    if (existing) {
        return { testId: existing.id, message: "Final test already exists" }
    }

    // 2. check completion
    const isCompleted = await checkIfRoutineCompleted(userId, planId)

    if (!isCompleted) {
        throw new Error("Routine not fully completed")
    }

    // 3. get all topics from plan
    const topicsData = await db
        .select({ topic: questions.topic })
        .from(routine_questions)
        .innerJoin(
            questions,
            eq(routine_questions.question_id, questions.question_id)
        )
        .where(eq(routine_questions.plan_id, planId))

    const topics = [...new Set(topicsData.map(t => t.topic))]

    // 4. fetch MCQs
    const mcqs = await db.query.mcq_questions.findMany({
        where: (mcq, { inArray }) => inArray(mcq.topic, topics)
    })

    // 5. randomize + limit
    const selected = mcqs
        .sort(() => 0.5 - Math.random())
        .slice(0, 25)

    // 6. create test
    const [test] = await db.insert(tests)
        .values({
            user_id: userId,
            plan_id: planId,
            type: "final"
        })
        .returning()

    // 7. map MCQs
    await db.insert(test_mcqs).values(
        selected.map(q => ({
            test_id: test.id,
            mcq_id: q.id
        }))
    )

    return {
        testId: test.id,
        totalQuestions: selected.length
    }
}