import db from "../db/dbConfig";
import { MemberType } from "../utils/types";
import { getMember } from "./membersServices";
import { RowDataPacket } from "mysql2";

export const sendMessage = async (
  content: string,
  fileUrl: string,
  channelId: string,
  memberId: string
) => {
  const messageQuery = `INSERT INTO messages (content, file_url, channel_id, member_id) VALUES (?, ?, ?, ?)`;

  return await new Promise((res, rej) => {
    db.query(messageQuery, [content, fileUrl, channelId, memberId], (err, result) => {
        if(err) {
            rej(err)
        } else {
            res(result);
        }
    });
  });
};

export const getMessages = async (cursor: string, channelId: string, MESSAGES_BATCH: number) => {
    const query = `SELECT messages.*
    FROM messages
    WHERE messages.channel_id = ?
    ${cursor ? "AND messages.id < ?" : ""}
    ORDER BY messages.created_at DESC
    LIMIT ? ${cursor ? "OFFSET 1" : ""}
    `
    const values = cursor ? [channelId, cursor, MESSAGES_BATCH] : [channelId, MESSAGES_BATCH];

    return await new Promise((res, rej)=>{
        db.query(query, values, async (err, result) => {
            if(err){
                rej(err)
            } else {
                const messages = result as RowDataPacket[];

                // Use Promise.all to wait for all member fetches
                const processedResult = await Promise.all(messages.map(async (message: any) => {
                    const member = await getMember(message.member_id) as MemberType;
                    return {
                        ...message,
                        member
                    };
                }));

                res(JSON.parse(JSON.stringify(processedResult)));
            }
        })
    })

}
