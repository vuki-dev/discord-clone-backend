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
