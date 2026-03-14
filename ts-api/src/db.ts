import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "app_user",
  password: process.env.DB_PASSWORD || "app_pass",
  database: process.env.DB_NAME || "mobile_api",
  connectionLimit: 10
});

export default pool;
