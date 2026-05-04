
import express from "express"
import {
    createTest,
    getTest,
    submitAnswer,
    getResult,
    createFinalTest
} from "../../controllers/test/test.controller.js";

const router = express.Router()

router.post("/create", createTest)
router.post("/create/final", createFinalTest)         // create test after completion
router.get("/:userId", getTest)             // get current test
router.post("/answer", submitAnswer)              // submit answer
router.get("/result/:testId", getResult)          // final result

export default router