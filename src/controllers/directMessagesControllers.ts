import { Response, Request } from "express";
import { getCurrentUser } from "../controllers/userControllers";
import { MemberRole } from "../utils/types";
import { v1 as uuidv1 } from "uuid";
import { getConversation } from "../services/conversationServices";
import {
  deleteDirectMessage,
  editDirectMessage,
  getDirectMessages,
  getSingleDirectMessage,
  sendDirectMessage,
} from "../services/directMessagesServices";

const MESSAGES_BATCH = 10;

export const getDirectMessagesRequest = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await getCurrentUser(token);

    const cursor = req.query.cursor as string;
    const conversationId = req.query.conversationId as string;

    if (!conversationId) {
      return res.status(400).json({ error: "Conversation ID is missing" });
    }

    let messages: any = [];

    messages = await getDirectMessages(
      cursor as string,
      conversationId,
      MESSAGES_BATCH
    );

    let nextCursor = null;

    if (messages.length === MESSAGES_BATCH) {
      nextCursor = messages[MESSAGES_BATCH - 1].created_at;
    }

    return res.status(200).json({ items: messages, nextCursor });
  } catch (err) {
    console.log("[DIRECT_MESSAGES_GET]", err);
    return res.status(500).json({ message: "Internal Error" });
  }
};

export const sendDirectMessageRequest = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await getCurrentUser(token);
    const { content, fileUrl } = req.body;
    const { conversationId } = req.query;

    if (!conversationId) {
      return res.status(400).json({ error: "Conversation ID is missing" });
    }

    if (!content) {
      return res.status(400).json({ error: "Content is missing" });
    }

    const conversation = await getConversation(
      conversationId as string,
      user.id
    );

    if (!conversation) {
      return res.status(404).json({ error: "Conversation is not found" });
    }

    const member =
      conversation.memberOne.user_id === user.id
        ? conversation.memberOne
        : conversation.memberTwo;

    if (!member) {
      return res.status(404).json({ error: "Member is not found" });
    }

    const messageId = uuidv1(); // Generate a UUID for the message ID

    await sendDirectMessage(
      messageId,
      content,
      fileUrl,
      conversationId as string,
      member.id
    );

    const message = await getSingleDirectMessage(
      messageId,
      conversationId as string
    );

    const channelKey = `chat:${conversationId}:messages`;

    res?.io?.emit(channelKey, message);

    return res.status(200).json(message);
  } catch (err) {
    console.log("DIRECT_MESSAGES_POST", err);
    return res.status(500).json({ message: "Internal error" });
  }
};

export const editOrDeleteDirectMessageRequest = async (
  req: Request,
  res: Response
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await getCurrentUser(token);
    const { conversationId } = req.query;
    const messageId = req.params.id;
    const { content } = req.body;

    if (!conversationId) {
      return res.status(400).json({ error: "Conversation ID is missing" });
    }

    const conversation = await getConversation(
      conversationId as string,
      user.id
    );

    const member =
      conversation.memberOne.user_id === user.id
        ? conversation.memberOne
        : conversation.memberTwo;

    if (!member) {
      return res.status(404).json({ error: "Member is not found" });
    }

    let message = await getSingleDirectMessage(
      messageId as string,
      conversationId as string
    );

    if (!message || message.deleted) {
      return res.status(404).json({ error: "Message not found" });
    }

    const isMessageOwner = message.member_id === member.id;
    const isAdmin = member.role === MemberRole.ADMIN;
    const isModerator = member.role === MemberRole.MODERATOR;
    const canModify = isMessageOwner || isAdmin || isModerator;

    if (!canModify) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method === "PATCH") {
      if (!isMessageOwner) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      await editDirectMessage(content, messageId, conversationId as string);
    }

    if (req.method === "DELETE") {
      await deleteDirectMessage(messageId, conversationId as string);
    }

    message = await getSingleDirectMessage(
      messageId as string,
      conversationId as string
    );

    const updateKey = `chat:${conversationId}:messages:update`;

    res?.io?.emit(updateKey, message);

    return res.status(200).json(message);
  } catch (err) {
    console.log("[DIRECT_MESSAGE_ID_EDIT/DELETE]", err);
    return res.status(500).json({ message: "Internal error" });
  }
};
