import express from 'express';
import wrapRoutes from '../../utils/wrapRoutes.js';
import { generateRoutineSchema } from '../../validators/routine.validator.js';
import { generateRoutine } from '../../controllers/routine/generateRoutine.controller.js';
import { validate } from '../../middlewares/zodvalidation.js';
const router = express.Router();


router.post('/generate', validate(generateRoutineSchema), generateRoutine)

export default wrapRoutes(router)