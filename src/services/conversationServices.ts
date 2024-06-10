import { RowDataPacket } from "mysql2";
import db from "../db/dbConfig";
import { ConversationType, MemberType } from "../utils/types";
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

  const conversation: ConversationType = await new Promise((res, rej) => {
    db.query<ConversationType[] & RowDataPacket[]>(query, [conversationId, userId], (err, result) => {
      if (err) {
        rej(err);
      } else {
        res(JSON.parse(JSON.stringify(result[0])));
      }
    });
  });

  conversation.memberOne = await getMember(conversation.member_one_id) as MemberType;
  conversation.memberTwo = await getMember(conversation.member_two_id) as MemberType;

  return conversation
};
