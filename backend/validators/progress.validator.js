import { z } from "zod";

export const completeQuestionSchema = z.object({
  userId: z
    .string({
      required_error: "userId is required",
      invalid_type_error: "userId must be a string"
    })
    .uuid("userId must be a valid UUID"),

  questionId: z
    .string({
      required_error: "questionId is required",
      invalid_type_error: "questionId must be a string"
    })
    .min(1, "questionId cannot be empty")
    .max(255, "questionId is too long")
});
