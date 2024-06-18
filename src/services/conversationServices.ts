import { RowDataPacket } from "mysql2";
import { executeQuery } from "../db/dbConfig";
import { MemberType } from "../utils/types";
import { getMember } from "./membersServices";

export const getConversation = async (
  conversationId: string,
  userId: string
) => {
  const query = `
    SELECT conversations.*
    FROM conversations
    JOIN members 
        ON members.id = conversations.member_one_id 
        OR members.id = conversations.member_two_id
    WHERE conversations.id = ? 
        AND members.user_id = ? 
        AND (
            members.id = conversations.member_one_id 
            OR members.id = conversations.member_two_id
        )`;

  const conversation = (await executeQuery(query, [conversationId, userId]) as RowDataPacket[])[0];

  conversation.memberOne = await getMember(conversation.member_one_id) as MemberType;
  conversation.memberTwo = await getMember(conversation.member_two_id) as MemberType;

  return conversation
};
