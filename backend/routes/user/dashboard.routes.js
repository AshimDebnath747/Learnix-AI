import express from 'express'
import { getUserProfile, getUserProgress, getRecentTests } from '../../controllers/user/dashboard.controller.js'
const router = express.Router()


router.get('/profile', getUserProfile)
router.get('/progress', getUserProgress)
//router.get('/progress/eachsubject', getProgressEachSubject)
//router.get('/routine/today', getTodayRoutine)
router.get('/test/recent', getRecentTests)

export default router
