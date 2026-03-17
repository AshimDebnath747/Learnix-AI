import { googleOAuthLogin } from "../../services/auth/authWithGoogle.service.js";

export const googleAuthUser = async (req, res) => {
  const { idToken } = req.validated;
  

  const result = await googleOAuthLogin({ idToken });
console.log(result.platform)
  // 🌐 WEB → set cookie
  if (result.aud === process.env.GOOGLE_CLIENT_WEB_ID) {
    return res
      .status(200)
      .cookie("uid", result.token, {
        httpOnly: true,
        secure: false, // true in production (HTTPS)
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: "Login successful for web",
      });
  }

  // 📱 MOBILE → return token
  return res.status(200).json({
    success: true,
    message: "Login successful for app",
    token: result.token,
    
  });
};