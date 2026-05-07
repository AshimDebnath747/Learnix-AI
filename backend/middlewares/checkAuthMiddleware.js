import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import AppError from "../utils/appError.js";

configDotenv();

export const checkAuthMiddleware = (req, res, next) => {
  // Check if cookie exists
  const token = req.cookies?.uid;

  if (!token) {
    throw new AppError("Unauthorized - No token provided", 401);
  }

  // Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    
    // Add user object to request
    req.user = decoded;
    next();
  } catch (error) {
    const message = error.message === "jwt expired" 
      ? "Unauthorized - Token expired" 
      : "Unauthorized - Invalid token";
    throw new AppError(message, 401);
  }
};

export default checkAuthMiddleware;
