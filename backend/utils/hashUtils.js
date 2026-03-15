import bcrypt from "bcrypt";

// ✅ Hash password
export async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// ✅ Compare password with hashed password
export async function comparePassword(password, hashedPassword) {
  const result = await bcrypt.compare(password, hashedPassword);
  return result
}