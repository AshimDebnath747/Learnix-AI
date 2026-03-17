import { email } from "zod";
import { login, register } from "../../services/auth/register.service.js";

export const registerUser = async (req, res,) => {

    const result = await register(req.validated);

    return res.status(201).json({
      success: true,
      message: result.message,
      user: result.user
    });
};

export const loginUser = async (req, res, ) => {

    const result = await login(req.validated);

    return res.status(200)
    .cookie("uid", result.token, {
    httpOnly: true,          // JS cannot access cookie (protects from XSS)
    // secure: true,            // cookie only sent over HTTPS
    sameSite: "strict",      // prevents CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
  })
  .json({
      success: true,
      message:result.message,
    });
};
export const logout = (req, res) => {
  res.clearCookie("uid", {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });

  return res.status(200).json({
    success: true,
    message: "Logout successful"
  });
};

