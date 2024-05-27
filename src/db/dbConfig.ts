import mysql from "mysql";

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to MySQL
db.connect((err: Error) => {
  if (err) {
    throw err;
  }
});

export default db;
