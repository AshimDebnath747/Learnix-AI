import {
    createTestService,
    getTestService,
    getResultService,
    submitAnswerService,
    createFinalTestService
}
    from "../../services/test/test.service.js"

export const createTest = async (req, res) => {
    try {
        const userId = req.user.id
        const test = await createTestService(userId)
        res.json(test)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const getTest = async (req, res) => {
    try {
        const { userId } = req.params
        const test = await getTestService(userId)
        res.json(test)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const submitAnswer = async (req, res) => {
    try {
        const data = await submitAnswerService(req.body)
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const getResult = async (req, res) => {
    try {
        const { testId } = req.params
        const result = await getResultService(testId)
        res.json(result)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const createFinalTest = async (req, res) => {
    try {
        const userId = req.user.id //it will req.user.id
        const { planId } = req.body
        console.log("user id ", userId)
        console.log("plan id ", planId)


        const result = await createFinalTestService(userId, planId)

        res.status(200).json(result)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}