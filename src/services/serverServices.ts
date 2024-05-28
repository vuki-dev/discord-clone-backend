import { RowDataPacket } from "mysql2";
import db from "../db/dbConfig";
import { MemberType, ServerType } from "../utils/types";

export const getServerWithMembers = async (
  serverId: string,
  userId: string
) => {
  const serverQuery = `SELECT servers.* 
    FROM servers
    JOIN members ON servers.id = members.server_id
    WHERE servers.id = ? AND members.server_id = ? AND members.user_id = ?
    LIMIT 1`;

  const server = await new Promise<ServerType | null>((res, rej) => {
    db.query<ServerType[] & RowDataPacket[]>(serverQuery, [serverId, serverId, userId], (err, result) => {
      if (err) {
        rej(err);
      } else {
        res(result.length ? JSON.parse(JSON.stringify(result[0])) : null)
      }
    });
  });

  if(!server){
    return null
  }

  const getMembersQuery = `SELECT * FROM members WHERE members.server_id = ?`;
  
  const members: MemberType[] = await new Promise((res, rej) => {
    db.query(getMembersQuery, [serverId], (err, result) => {
      if (err) {
        rej(err);
      } else {
        res(JSON.parse(JSON.stringify(result)))
      }
    });
  });

  server.members = members;
  return server;
};
