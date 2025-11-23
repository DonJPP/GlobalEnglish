// src/config/db.js

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Pool de conexiones a MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST,       // localhost por defecto
    user: process.env.DB_USER,       // root o el que uses
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,   // global_english
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;
