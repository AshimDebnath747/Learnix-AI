
import express from "express"
import {
    createWeeklyTest,
    getWeeklyTest,
    submitAnswer,
    getResult
} from "../controllers/test.controller.js"

const router = express.Router()

router.post("/create", createWeeklyTest)          // create test after completion
router.get("/:userId", getWeeklyTest)             // get current test
router.post("/answer", submitAnswer)              // submit answer
router.get("/result/:testId", getResult)          // final result

export default router