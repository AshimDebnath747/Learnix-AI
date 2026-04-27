import * as testService from "../services/test.service.js"

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