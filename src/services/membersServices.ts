import { RowDataPacket } from "mysql2"
import { executeQuery } from "../db/dbConfig"

export const getMember = async (memberId: string) => {
    const query = `SELECT members.*, users.name, users.email, users.image_url
    FROM members
    JOIN users ON members.user_id = users.id
    WHERE members.id = ?`;

    return (await executeQuery(query, [memberId]) as RowDataPacket[])[0];
}