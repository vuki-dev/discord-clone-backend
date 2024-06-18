import db, { executeQuery } from "../db/dbConfig";

export const getUserById = async (userId: string | unknown) => {
  const user = await executeQuery(
    "SELECT id, name, email, created_at FROM users WHERE id = ?",
    [userId]
  );

  return user;
};
