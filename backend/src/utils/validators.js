import pool from "../config/db.js";

/**
 * Verifica si un ID ya existe en una tabla
 * @param {string} tabla - Nombre de la tabla
 * @param {string} columna - Nombre de la columna del ID
 * @param {*} valor - Valor del ID
 */
export async function validarIdUnico(tabla, columna, valor) {
  const [rows] = await pool.query(
    `SELECT ${columna} FROM ${tabla} WHERE ${columna} = ?`,
    [valor]
  );

  return rows.length > 0; // true = ya existe
}
