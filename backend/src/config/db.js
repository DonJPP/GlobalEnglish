import dotenv from "dotenv";
dotenv.config();   // ← DEBE ESTAR ARRIBA

import mysql from "mysql2/promise";

console.log(">>> db.js ejecutado");
console.log("USER=", process.env.DB_USER);
console.log("PASS=", process.env.DB_PASSWORD);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
});

export default pool;
