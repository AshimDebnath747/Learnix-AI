import { generateRoutineLogic } from "../../services/routine/generateRoutine.service.js";

export const generateRoutine = async (req, res, next) => {
    try {
        const result = await generateRoutineLogic(req.validated);

        return res.status(201).json({
            success: true,
            message: result.message,
            routine: result.routine
        });
    } catch (error) {
        next(error);
    }
}