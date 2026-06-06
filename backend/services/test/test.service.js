import { db } from "../../config/db.js"
import { tests } from "../../model/testsSchema.js"
import { questions } from "../../model/questionsSchema.js"
import { routineQuestions } from "../../model/routineQuestionsSchema.js"
import { mcqQuestions } from "../../model/mcqQuestionsSchema.js"
import { eq, and, sql, inArray } from "drizzle-orm"
import { testMcqs } from "../../model/testMcqsSchema.js"
import { userProgress } from "../../model/userProgressSchema.js"
import { checkIfRoutineCompleted } from "./checkIfRoutineComplete.service.js"
import { duration } from "drizzle-orm/gel-core"

export const createTestService = async (userId, limit = 20, planId) => {

    return await db.transaction(async (tx) => {
        //check for any active tests
        const activeTest = await tx
            .select()
            .from(tests)
        where(eq(tests.userId, userId),
            eq(tests.active, true))

        if (activeTest.lenght) {
            throw new Error("An active test already exists!")
        }
        // 1. get completed topics (no full completion check)
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
        const duration = mcqs.length * 180
        const createdAt = new Date()

        // we will assign 3 minutes = 180 secs for each question that's fixed for now
        // 5. create test (type = practice)
        const [test] = await tx.insert(tests)
            .values({
                userId: userId,
                createdAt: createdAt,
                type: "practice",
                planId: planId,
                duration: duration
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
            duration: duration,
            createdAt: createdAt,
            totalQuestions: selected.length,
            safeMcqs: safeMcqs
        }
    })
}

export const getTestService = async (userId) => {
    const test = await db
        .select({
            testId: tests.testId,
            createdAt: tests.createdAt,
            duration: tests.duration
        })
        .from(tests)
        .where(
            and(
                eq(tests.userId, userId),
                eq(tests.active, true)
            )
        )

    return {
        testId,
        createdAt,
        duration
    }
}
//have not tested it yet , will test it when frontend is implemented!
export const submitAnswerService = async (testId, answers) => {
    console.log("test id:", testId)
    const [submittedTest] = await db
        .select()
        .from(tests)
        .where(eq(
            tests.testId, testId
        ))
    const endTime =
        new Date(submittedTest.createdAt).getTime() +
        submittedTest.duration * 1000;

    const submittedOnTime =
        Date.now() <= endTime;
    const questions = await db.
        select({
            testMcqId: testMcqs.id,
            mcqId: mcqQuestions.id,
            correctOption: mcqQuestions.correctOption
        })
        .from(testMcqs)
        .innerJoin(
            mcqQuestions,
            eq(testMcqs.mcqId, mcqQuestions.id)
        )
        .where(eq(testMcqs.testId, testId))
    console.log(questions)
    const questionMap = new Map();

    questions.forEach((q) => {
        questionMap.set(q.mcqId, q);
    });

    const updates = [];
    let correctAnswers = 0
    for (const answer in answers) {
        question = questionMap.get(answer.mcqId)
        if (answer.selectedOption === question.correctOption) {
            correctAnswers += 1
        }
        questions.push({
            testMcqId: question.testMcqId,
            selectedOption: answer.selectedOption,
            isCorrect: answer.selectedOption === question.correctOption
        })
        await Promise.all(
            updates.map((u) =>
                db.update(testMcqs)
                    .set({
                        selectedOption: u.selectedOption,
                        isCorrect: u.isCorrect,
                    })
                    .where(eq(testMcqs.id, u.testMcqId))
            )
        );

        return {
            correctAnswers: correctAnswers,
            totalQuestions: questions.length,
        }
    }
}
//used when user checks test results on dashbaord - will do later
// export const getResultService = async (testId) => {
//     const answers = await db.query.userAnswers.findMany({
//         where: { test_id: testId }
//     })

//     const total = answers.length
//     const correct = answers.filter(a => a.is_correct).length

//     return {
//         total,
//         correct,
//         score: (correct / total) * 100
//     }
// }


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
                    eq(tests.type, "final"),
                    eq(tests.active, true)
                )
            )
            .limit(1);

        if (existing.length) {
            return { testId: existing[0].id, message: "Test already Exists" };
        }

        // 2. check completion[omitted for now 06 /05 / 26]
        // const isCompleted = await checkIfRoutineCompleted(userId, planId)

        // if (!isCompleted) {
        //     throw new Error("Routine not fully completed")
        // }

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

        const duration = mcqs.length * 180
        const createdAt = new Date()
        // 6. create test
        const [test] = await tx.insert(tests)
            .values({
                userId: userId,
                createdAt: createdAt,
                planId: planId,
                type: "final",
                duration: duration
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
            duration: duration,
            createdAt: createdAt,
            totalQuestions: safeMcqs.length,
            safeMcqs: safeMcqs
        }
    })
}