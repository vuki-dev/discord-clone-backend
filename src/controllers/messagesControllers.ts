import { Response, Request } from "express";
import { getCurrentUser } from "../controllers/userControllers";
import { getServerWithMembers } from "../services/serverServices";
import { getChannel } from "../services/channelServices";
import { getMessages, sendMessage } from "../services/messagesServices";

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

    const message = await sendMessage(
      content,
      fileUrl,
      channelId as string,
      member.id
    );

    const channelKey = `chat:${channelId}:messages`;

    res?.socket?.emit(channelKey, message);

    return res.status(200).json(message);
  } catch (err) {
    console.log("MESSAGES_POST", err);
    return res.status(500).json({ message: "Internal error" });
  }
};

export const editMessageRequest = async (req: Request, res: Response) => {
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

    return res.json("hello patch");
  } catch (err) {
    console.log("[MESSAGE_ID_EDIT]", err);
    return res.status(500).json({ message: "Internal error" });
  }
};

export const deleteMessageRequest = async () => {};
