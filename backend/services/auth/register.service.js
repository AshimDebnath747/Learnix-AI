import { db } from "../../config/db.js";
import { users } from "../../model/userschema.js";
import AppError from "../../utils/appError.js";
import { eq } from "drizzle-orm";
import { comparePassword, hashPassword } from "../../utils/hashUtils.js";
import { signToken } from "../../utils/jwtsign.js";

export const register = async ({ email, username, password }) => {

  // check if email already exists
 const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new AppError("Email already registered", 409);
  }
  const hashedPassword = await hashPassword(password);

  const result = await db.insert(users)
    .values({
      email,
      username,
      password: hashedPassword
    })
    .returning();
    delete result[0].password;

  return {
    message: "User created successfully",
    user: result[0]
  };
};

export const login = async ({email,password})=>{
      // check if email exists
 const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
    
    if (existingUser.length == 0) {
        throw new AppError("Email doesn't exist", 404);
    }
      //check password
    const hashedpassword = existingUser[0].password
    const checkedPassword = await comparePassword(password, hashedpassword)

    if (!checkedPassword) {
   throw new AppError("Invalid password",401);
}

//create jwt payload
    const payload ={
        id:existingUser[0].id,
        email:existingUser[0].email
    }

    const token = signToken(payload)

  return {
    message:'Login successfull',
    token
    
  }
};

export const changePassword = async ({ userId, currentPassword, newPassword }) => {
  
  // Get user from DB
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user.length === 0) {
    throw new AppError("User not found", 404);
  }

  // Verify current password
  const isPasswordValid = await comparePassword(
    currentPassword, 
    user[0].password
  );

  if (!isPasswordValid) {
    throw new AppError("Current password is incorrect", 401);
  }

  // Check if new password is same as old
  const isSamePassword = await comparePassword(
    newPassword, 
    user[0].password
  );

  if (isSamePassword) {
    throw new AppError("New password cannot be the same as current password", 400);
  }

  // Hash and update password
  const hashedNewPassword = await hashPassword(newPassword);

  await db.update(users)
    .set({ password: hashedNewPassword })
    .where(eq(users.id, userId));

  return {
    message: "Password changed successfully"
  };
}