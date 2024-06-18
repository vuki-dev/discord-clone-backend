import { RowDataPacket } from "mysql2";
import db, { executeQuery } from "../db/dbConfig";
import { UserType } from "../utils/types";

export const getUserById = async (userId: string | unknown) => {
  const user = (await executeQuery(
    "SELECT id, name, email, created_at FROM users WHERE id = ?",
    [userId]
  ) as RowDataPacket[])[0];

  return user;
};
