import { format, parseISO } from "date-fns";
import db, { executeQuery } from "../db/dbConfig";
import { MemberType, MessageType } from "../utils/types";
import { getMember } from "./membersServices";
import { RowDataPacket } from "mysql2";

export const sendMessage = async (
  messageId: string,
  content: string,
  fileUrl: string,
  channelId: string,
  memberId: string
) => {
  const messageQuery = `INSERT INTO messages (id, content, file_url, channel_id, member_id) VALUES (?, ?, ?, ?, ?)`;

  return await executeQuery(messageQuery, [messageId, content, fileUrl, channelId, memberId]);
};

export const getMessages = async (cursor: string, channelId: string, MESSAGES_BATCH: number) => {
    const formattedCursor = cursor ? format(parseISO(cursor), 'yyyy-MM-dd HH:mm:ss') : "";

    const query = `SELECT messages.*
    FROM messages
    WHERE messages.channel_id = ?
    ${cursor ? "AND UNIX_TIMESTAMP(messages.created_at) < UNIX_TIMESTAMP(?)" : ""}
    ORDER BY messages.created_at DESC
    LIMIT ?
    `

    const values = cursor ? [channelId, formattedCursor, MESSAGES_BATCH] : [channelId, MESSAGES_BATCH];

    const messages = await executeQuery(query, values) as RowDataPacket[];

    const processedResult = await Promise.all(messages.map(async (message: any) => {
        const member = await getMember(message.member_id) as MemberType;
        return {
            ...message,
            member
        };
    }));

    return processedResult
}


export const getSingleMessage = async (messageId: string, channelId: string) => {
    const query = `SELECT messages.*
    FROM messages
    WHERE messages.id = ? AND messages.channel_id = ?`

    const message = (await executeQuery(query, [messageId, channelId]) as RowDataPacket[])[0] as MessageType;

    if(!message){
        return null
    }

    message.member = await getMember(message.member_id) as MemberType;

    return message;
}   

export const editMessage = async (content: string, messageId: string, channelId: string) => {
    const query = `UPDATE messages
    SET content = ?
    WHERE id = ? AND channel_id = ?`;

    return await executeQuery(query, [content, messageId, channelId])
}

export const deleteMessage = async (messageId: string, channelId: string) => {
    const query = `UPDATE messages
    SET content = 'This message has been deleted', file_url = NULL, deleted = 1
    WHERE id = ? AND channel_id = ?`;

    return await executeQuery(query, [messageId, channelId]);
}
