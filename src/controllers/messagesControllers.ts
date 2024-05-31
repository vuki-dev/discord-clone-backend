import { Response, Request } from "express";
import { getCurrentUser } from "../controllers/userControllers";
import { getServerWithMembers } from "../services/serverServices";
import { getChannel } from "../services/channelServices";
import { deleteMessage, editMessage, getMessages, getSingleMessage, sendMessage } from "../services/messagesServices";
import { MemberRole } from "../utils/types";
import { v4 as uuidv4 } from 'uuid';

const MESSAGES_BATCH = 10;

export const getMessagesRequest = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await getCurrentUser(token);

    const cursor = req.query.cursor as string;
    const channelId = req.query.channelId as string;

    if (!channelId) {
      return res.status(400).json({ error: "Channel ID is missing" });
    }

    let messages: any = [];

    messages = await getMessages(cursor as string, channelId, MESSAGES_BATCH);

    let nextCursor = null;

    if (messages.length === MESSAGES_BATCH) {
      nextCursor = messages[MESSAGES_BATCH - 1].id;
    }

    return res.status(200).json({ items: messages, nextCursor });
  } catch (err) {
    console.log("[MESSAGES_GET]", err);
    return res.status(500).json({ message: "Internal Error" });
  }
};

export const sendMessageRequest = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await getCurrentUser(token);
    const { content, fileUrl } = req.body;
    const { serverId, channelId } = req.query;

    if (!serverId) {
      return res.status(400).json({ error: "Server ID is missing" });
    }

    if (!channelId) {
      return res.status(400).json({ error: "Channel ID is missing" });
    }

    if (!content) {
      return res.status(400).json({ error: "Content is missing" });
    }

    const server = await getServerWithMembers(serverId as string, user.id);

    if (!server) {
      return res.status(404).json({ error: "Server is not found" });
    }

    const channel = await getChannel(serverId as string, channelId as string);

    if (!channel) {
      return res.status(404).json({ error: "Channel is not found" });
    }

    const member = server.members?.find((member) => member.user_id === user.id);

    if (!member) {
      return res.status(404).json({ error: "Member is not found" });
    }

    const messageId = uuidv4(); // Generate a UUID for the message ID

    await sendMessage(
      messageId,
      content,
      fileUrl,
      channelId as string,
      member.id
    );

    const message = await getSingleMessage(messageId, channelId as string);

    const channelKey = `chat:${channelId}:messages`;

    res?.io?.emit(channelKey, message)

    return res.status(200).json(message);
  } catch (err) {
    console.log("MESSAGES_POST", err);
    return res.status(500).json({ message: "Internal error" });
  }
};

export const editOrDeleteMessageRequest = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await getCurrentUser(token);
    const {serverId, channelId} = req.query;
    const messageId = req.params.id;
    const { content } = req.body;

    if (!serverId) {
      return res.status(400).json({ error: "Server ID is missing" });
    }

    if (!channelId) {
      return res.status(400).json({ error: "Channel ID is missing" });
    }

    const server = await getServerWithMembers(serverId as string, user.id);

    if (!server) {
      return res.status(404).json({ error: "Server not found" });
    }

    const channel = await getChannel(serverId as string, channelId as string);

    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    const member = server.members?.find((member) => member.user_id === user.id);

    if (!member) {
      return res.status(404).json({ error: "Member is not found" });
    }

    let message = await getSingleMessage(messageId as string, channelId as string);

    if(!message || message.deleted){
      return res.status(404).json({error: "Message not found"});
    };

    const isMessageOwner = message.member_id === member.id;
    const isAdmin = member.role === MemberRole.ADMIN;
    const isModerator = member.role === MemberRole.MODERATOR;
    const canModify = isMessageOwner || isAdmin || isModerator;

    if(!canModify){
      return res.status(401).json({error: "Unauthorized"});
    }

    if(req.method === "PATCH"){
      if(!isMessageOwner){
        return res.status(401).json({error: "Unauthorized"});
      }

      await editMessage(content, messageId, channelId as string);
    }

    if(req.method === "DELETE"){
      await deleteMessage(messageId, channelId as string)
    }

    message = await getSingleMessage(messageId as string, channelId as string);

    const updateKey = `chat:${channelId}:messages:update`;

    res?.io?.emit(updateKey, message);;

    return res.status(200).json(message);
  } catch (err) {
    console.log("[MESSAGE_ID_EDIT]", err);
    return res.status(500).json({ message: "Internal error" });
  }
};