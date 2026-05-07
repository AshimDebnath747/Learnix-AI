import { z } from "zod";

export const finalTestSchema = z.object({
    planId: z
        .string({
            required_error: "userId is required",
            invalid_type_error: "userId must be a string"
        })
        .uuid("userId must be a valid UUID"),
});