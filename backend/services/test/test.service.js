import { db } from "../config/db.js"

export const createTest = async (userId) => {
    // 1. check if user completed routine
    const completed = await db.query.user_progress.findMany({
        where: { user_id: userId, status: "completed" }
    })

    if (!completed.length) throw new Error("Routine not completed")

    // 2. extract topics
    const topics = completed.map(q => q.topic)

    // 3. fetch MCQs based on topics
    const mcqs = await db.query.mcq_questions.findMany({
        where: (mcq, { inArray }) => inArray(mcq.topic, topics)
    })

    // 4. create test
    const [test] = await db.insert(weekly_tests)
        .values({ user_id: userId })
        .returning()

    // 5. map MCQs to test
    const mappings = mcqs.map(q => ({
        test_id: test.id,
        mcq_id: q.id
    }))

    await db.insert(test_mcqs).values(mappings)

    return { testId: test.id, totalQuestions: mcqs.length }
}

export const getTest = async (userId) => {
    const test = await db.query.weekly_tests.findFirst({
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