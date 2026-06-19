import { getUserProfileService, getRecentTestsService, getUserProgressService, searchUsersWithProgressService } from "../../services/user/dashboard.service.js"
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

// Search users and get their details with progress
export const searchUsersWithProgress = async (req, res) => {
    try {
        const { search } = req.query
        if (!search || search.trim() === "") {
            return res.status(400).json({ error: "Search term is required" })
        }
        const results = await searchUsersWithProgressService(search)
        res.json(results)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
