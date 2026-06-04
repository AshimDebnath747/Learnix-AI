
import express from "express"
import {
    createTest,
    getTest,
    submitAnswer,
    getResult,
    createFinalTest
} from "../../controllers/test/test.controller.js";
import { finalTestSchema } from "../../validators/finalTest.validator.js";
import { validate } from "../../middlewares/zodvalidation.js";
import wrapRoutes from "../../utils/wrapRoutes.js";

const router = express.Router()
router.post("/create", createTest)
router.post("/create/final", validate(finalTestSchema), createFinalTest)  // create test after completion
router.get("/active", getTest)        // get active test -> useful for frontend
router.post("/answer", submitAnswer)     // submit answer
//router.get("/result/:testId", getResult)  // not needed for now because already the result will be returned after "/answer"

export default wrapRoutes(router)