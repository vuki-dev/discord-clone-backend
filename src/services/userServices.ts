import db from "../db/dbConfig";

export const getUserById = async (userId:string | unknown) => {
    let query = `SELECT id, name, email, created_at FROM users WHERE id = ?`;

    const user = await new Promise((res, rej) => {
        db.query(query, [userId], (err: any, result: any) => {
            if (err) {
                rej(err.message)
            } else {
                res(result[0]);
            }
        })
    })

    return user;    
}