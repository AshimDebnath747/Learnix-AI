import { getUserProfileService, getRecentTestsService, getUserProgressService } from "../../services/user/dashboard.service.js"
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id
        const result = await getUserProfileService(userId)
        console.log("result:", result)
        res.json(result)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const getRecentTests = async (req, res) => {
    try {
        const userId = req.user.id
        const result = await getRecentTestsService(userId)
        res.json(result)

    } catch (err) {
        res.status(500).json({ error: err.message })

    }
}

export const getUserProgress = async (req, res) => {
    try {
        const userId = req.user.id
        const result = await getUserProgressService(userId)
        res.json(result)

    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
