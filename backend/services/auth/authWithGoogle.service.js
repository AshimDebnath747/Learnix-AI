import { db } from "../../config/db.js";
import { users } from "../../model/userschema.js";
import { eq } from "drizzle-orm";
import AppError from "../../utils/appError.js";
import { signToken } from "../../utils/jwtsign.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_WEB_ID);

export const googleOAuthLogin = async ({ idToken }) => {
 
  // 1 verify token with google
  const ticket = await client.verifyIdToken({
    idToken,
    audience: [process.env.GOOGLE_CLIENT_WEB_ID,
      process.env.GOOGLE_CLIENT_APP_ID

    ]
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new AppError("Invalid Google token", 401);
  }

  const { email, name, aud } = payload;
  

  if (!email) {
    throw new AppError("Google account email not found", 400);
  }

  // 2 check if user exists
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  let user;

  if (result.length === 0) {
    
    // 3 create new user
    const newUser = await db.insert(users)
      .values({
        email,
        username: name,
        password: "baler password"
      })
      .returning({
        id: users.id,
        email: users.email,
        username: users.username
      });

    user = newUser[0];

  } else {
    user = result[0];
  }

  // 4 generate jwt
  const token = signToken({
    id: user.id,
    email: user.email
  });

  return {
    message: "Google login successful",
    token,
    aud
  };
};