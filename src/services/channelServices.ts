import { RowDataPacket } from "mysql2";
import db, { executeQuery } from "../db/dbConfig";
import { ChannelType } from "../utils/types";

export const getChannel = async (serverId: string, channelId: string) => {
  const channelQuery =
    "SELECT * FROM channels WHERE channels.id = ? AND channels.server_id = ? LIMIT 1";

  const result = await executeQuery(channelQuery, [channelId, serverId]);
  const channel = (result as RowDataPacket[])[0];

  return channel;
};
