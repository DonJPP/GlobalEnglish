import dotenv from "dotenv";
dotenv.config();

import pool from "./config/db.js";

async function test() {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS resultado");
    console.log("Conexión exitosa. Resultado:", rows[0].resultado);
  } catch (err) {
    console.error("Error al conectar a MySQL:", err.message);
    console.error("Detalle:", err); // ← IMPORTANTE
  }
}

test();

