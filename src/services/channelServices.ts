import { RowDataPacket } from "mysql2";
import db from "../db/dbConfig";
import { ChannelType } from "../utils/types";

export const getChannel = async (serverId: string, channelId: string) => {
  const channelQuery =
    "SELECT * FROM channels WHERE channels.id = ? AND channels.server_id = ? LIMIT 1";

  const channel = await new Promise<ChannelType | null>((res, rej) => {
    db.query<ChannelType[] & RowDataPacket[]>(
      channelQuery,
      [channelId, serverId],
      (err, result) => {
        if(err){
            rej(err)
        } else {
            res(JSON.parse(JSON.stringify(result[0])));
        }
      }
    );
  });

  return channel;
};
