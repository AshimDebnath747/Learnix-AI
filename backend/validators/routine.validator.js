import { z } from 'zod';
export const generateRoutineSchema = z.object({

    semester: z
        .number()
        .int()
        .min(1, { message: "Semester must be at least 1" })
        .max(8, { message: "Semester cannot exceed 8" }),

    daysLeft: z
        .number()
        .int()
        .min(1, { message: "Days must be at least 1" })
        .max(365, { message: "Days too large (max 365)" })
});