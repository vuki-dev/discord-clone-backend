import { format, parseISO } from "date-fns";
import db from "../db/dbConfig";
import { MemberType, MessageType } from "../utils/types";
import { getMember } from "./membersServices";
import { RowDataPacket } from "mysql2";

export const sendDirectMessage = async (
  messageId: string,
  content: string,
  fileUrl: string,
  channelId: string,
  memberId: string
) => {
  const messageQuery = `INSERT INTO messages (id, content, file_url, channel_id, member_id) VALUES (?, ?, ?, ?, ?)`;

  return await new Promise((res, rej) => {
    db.query(messageQuery, [messageId, content, fileUrl, channelId, memberId], (err, result) => {
        if(err) {
            rej(err)
        } else {
            res(result);
        }
    });
  });
};

export const getDirectMessages = async (cursor: string, channelId: string, MESSAGES_BATCH: number) => {
    // const query = `SELECT messages.*
    // FROM messages
    // WHERE messages.channel_id = ?
    // ${cursor ? "AND messages.id < ?" : ""}
    // ORDER BY messages.created_at DESC
    // LIMIT ? ${cursor ? "OFFSET 1" : ""}
    // `

    const formattedCursor = cursor ? format(parseISO(cursor), 'yyyy-MM-dd HH:mm:ss') : "";

    const query = `SELECT messages.*
    FROM messages
    WHERE messages.channel_id = ?
    ${cursor ? "AND UNIX_TIMESTAMP(messages.created_at) < UNIX_TIMESTAMP(?)" : ""}
    ORDER BY messages.created_at DESC
    LIMIT ?
    `

    const values = cursor ? [channelId, formattedCursor, MESSAGES_BATCH] : [channelId, MESSAGES_BATCH];

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


export const getSingleDirectMessage = async (messageId: string, channelId: string) => {
    const query = `SELECT messages.*
    FROM messages
    WHERE messages.id = ? AND messages.channel_id = ?`

    const message: MessageType = await new Promise((res, rej)=>{
        db.query<MessageType[] & RowDataPacket[]>(query, [messageId, channelId], async (err, result) => {
            if(err){
                rej(err)
            } else {
                res(JSON.parse(JSON.stringify(result[0])));
            }
        })
    })

    if(!message){
        return null
    }

    message.member = await getMember(message.member_id) as MemberType;

    return message;
}   

export const editDirectMessage = async (content: string, messageId: string, channelId: string) => {
    const query = `UPDATE messages
    SET content = ?
    WHERE id = ? AND channel_id = ?`;

    return await new Promise((res, rej)=>{
        db.query(query, [content, messageId, channelId], (err, result) => {
            if(err){
                rej(err);
            } else {
                res(result);
            }
        })
    })
}

export const deleteDirectMessage = async (messageId: string, channelId: string) => {
    const query = `UPDATE messages
    SET content = 'This message has been deleted', file_url = NULL, deleted = 1
    WHERE id = ? AND channel_id = ?`;

    return await new Promise((res, rej)=>{
        db.query(query, [messageId, channelId], (err, result) => {
            if(err){
                rej(err);
            } else {
                res(result);
            }
        })
    })
}
