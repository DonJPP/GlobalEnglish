import pool from "./config/db.js";

async function testConnection() {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS resultado");
    console.log("Conexión exitosa ✔ Resultado:", rows[0].resultado);
  } catch (error) {
    console.error("❌ Error al conectar a MySQL:", error.message);
  }
}

testConnection();
