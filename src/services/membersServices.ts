import { RowDataPacket } from "mysql2"
import db from "../db/dbConfig"
import { MemberType } from "../utils/types"

export const getMember = async (memberId: string) => {
    const query = `SELECT members.*, users.name, users.email, users.image_url
    FROM members
    JOIN users ON members.user_id = users.id
    WHERE members.id = ?`;

    return await new Promise<MemberType | null>((res, rej)=>{
        db.query<MemberType[] & RowDataPacket[]>(query, [memberId], (err, result)=>{
            if(err){
                rej(err)
            } else {
                res(JSON.parse(JSON.stringify(result[0])));
            }
        })
    })
}