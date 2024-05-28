import db from "../db/dbConfig";

export const sendMessage = async (
  content: string,
  fileUrl: string,
  channelId: string,
  memberId: string
) => {
  const messageQuery = `INSERT INTO messages (content, file_url, channel_id, member_id) VALUES (?, ?, ?, ?)`;

  return await new Promise((res, rej) => {
    db.query(messageQuery, [content, fileUrl, channelId, memberId], (err, result) => {
        if(err) {
            rej(err)
        } else {
            res(result);
        }
    });
  });
};

export const getMessages = async (cursor: string, channelId: string, MESSAGES_BATCH: number) => {
    const query = `SELECT messages.*
    FROM messages
    WHERE messages.channel_id = ?
    ${cursor ? "AND messages.id < ?" : ""}
    ORDER BY messages.created_at DESC
    LIMIT ? ${cursor ? "OFFSET 1" : ""}
    `
    const values = cursor ? [channelId, cursor, MESSAGES_BATCH] : [channelId, MESSAGES_BATCH];

    return await new Promise((res, rej)=>{
        db.query(query, values, (err, result) => {
            if(err){
                rej(err)
            } else {
                res(JSON.parse(JSON.stringify(result)))
            }
        })
    })

}
