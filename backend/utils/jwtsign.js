import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";

configDotenv()

export const signToken = (payload) => {
  return jwt.sign(
    payload,              // payload
    process.env.JWT_SECRET,      // secret key
    { expiresIn: process.env.JWT_EXPIRES_IN }          // options
  );
};