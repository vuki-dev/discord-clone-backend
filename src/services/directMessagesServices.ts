import { format, parseISO } from "date-fns";
import db from "../db/dbConfig";
import { MemberType, MessageType } from "../utils/types";
import { getMember } from "./membersServices";
import { RowDataPacket } from "mysql2";
import { executeQuery } from "../db/dbConfig";

export const sendDirectMessage = async (
  messageId: string,
  content: string,
  fileUrl: string,
  conversationId: string,
  memberId: string
) => {
  const messageQuery = `INSERT INTO direct_messages (id, content, file_url, conversation_id, member_id) VALUES (?, ?, ?, ?, ?)`;

  return await executeQuery(messageQuery, [messageId, content, fileUrl, conversationId, memberId])
};

export const getDirectMessages = async (cursor: string, conversationId: string, MESSAGES_BATCH: number) => {
    const formattedCursor = cursor ? format(parseISO(cursor), 'yyyy-MM-dd HH:mm:ss') : "";

    const query = `
        SELECT direct_messages.*
        FROM direct_messages
        WHERE direct_messages.conversation_id = ?
        ${cursor ? "AND UNIX_TIMESTAMP(direct_messages.created_at) < UNIX_TIMESTAMP(?)" : ""}
        ORDER BY direct_messages.created_at DESC
        LIMIT ?
    `;

    const values = cursor ? [conversationId, formattedCursor, MESSAGES_BATCH] : [conversationId, MESSAGES_BATCH];

    const result = await executeQuery(query, values);
    const messages = result as RowDataPacket[];

    // Use Promise.all to wait for all member fetches
    const processedResult = await Promise.all(messages.map(async (message: any) => {
      const member = await getMember(message.member_id) as MemberType;
      return {
        ...message,
        member
      };
    }));

    return processedResult;
}


export const getSingleDirectMessage = async (messageId: string, conversationId: string) => {
    const query = `SELECT direct_messages.*
    FROM direct_messages
    WHERE direct_messages.id = ? AND direct_messages.conversation_id = ?`

    const result = await executeQuery(query, [messageId, conversationId]);
    const message = (result as RowDataPacket[])[0];

    if(!message){
        return null
    }

    message.member = await getMember(message.member_id) as MemberType;

    return message;
}   

export const editDirectMessage = async (content: string, messageId: string, conversationId: string) => {
    const query = `UPDATE direct_messages
    SET content = ?
    WHERE id = ? AND conversation_id = ?`;

    return await executeQuery(query, [content, messageId, conversationId]);
}

export const deleteDirectMessage = async (messageId: string, conversationId: string) => {
    const query = `UPDATE direct_messages
    SET content = 'This message has been deleted', file_url = NULL, deleted = 1
    WHERE id = ? AND conversation_id = ?`;

    return await executeQuery(query, [messageId, conversationId]);
}
