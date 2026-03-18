import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),

  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username too long"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
});

export const googleAuthSchema = z.object({
  idToken: z
    .string({
      required_error: "Google idToken is required",
      invalid_type_error: "idToken must be a string",
    })
    .min(1, "Invalid idToken")})