import { RowDataPacket } from "mysql2";
import db, { executeQuery } from "../db/dbConfig";
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

  const server = (await executeQuery(serverQuery, [serverId, serverId, userId]) as RowDataPacket[])[0] as ServerType;  

  if(!server){
    return null
  }

  const getMembersQuery = `SELECT * FROM members WHERE members.server_id = ?`;
  
  const membersResult = await executeQuery(getMembersQuery, [serverId]) as RowDataPacket[];
  const members = membersResult as MemberType[];

  server.members = members;
  return server;
};
