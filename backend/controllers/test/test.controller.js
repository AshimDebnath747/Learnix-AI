import { testService, createFinalTestService } from "../../services/test/test.service.js"

export const createWeeklyTest = async (req, res) => {
    try {
        const { userId } = req.body
        const test = await testService.createTest(userId)
        res.json(test)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const getWeeklyTest = async (req, res) => {
    try {
        const { userId } = req.params
        const test = await testService.getTest(userId)
        res.json(test)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const submitAnswer = async (req, res) => {
    try {
        const data = await testService.submitAnswer(req.body)
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const getResult = async (req, res) => {
    try {
        const { testId } = req.params
        const result = await testService.getResult(testId)
        res.json(result)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const createFinalTest = async (req, res) => {
    try {
        const userId = req.user.id
        const { planId } = req.body

        const result = await createFinalTestService(userId, planId)

        res.status(200).json(result)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}