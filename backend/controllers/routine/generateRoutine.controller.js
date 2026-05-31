import { generateRoutineLogic } from "../../services/routine/generateRoutine.service.js";

export const generateRoutine = async (req, res) => {
    try {
        const userId = req.user.id
        const result = await generateRoutineLogic(userId, req.validated);

        return res.status(201).json({
            success: true,
            message: result.message,
            routine: result.routine,
            questionsInserted: result.questionsInserted
        });
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}