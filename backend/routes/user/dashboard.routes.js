import express from 'express'
import { getUserProfile, getUserProgress, getRecentTests, searchUsersWithProgress } from '../../controllers/user/dashboard.controller.js'
const router = express.Router()


router.get('/profile', getUserProfile)
router.get('/progress', getUserProgress)
//router.get('/progress/eachsubject', getProgressEachSubject)
//router.get('/routine/today', getTodayRoutine)
router.get('/test/recent', getRecentTests)

// Search for users with their progress details
router.get('/search', searchUsersWithProgress)

export default router
