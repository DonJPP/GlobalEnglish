import pool from "../config/db.js";

// Obtener lista de tutores
export async function obtenerTutores() {
  try {
    console.log(">>> Ejecutando SELECT * FROM tutor");
    const [rows] = await pool.query("SELECT * FROM tutor");
    console.log(">>> Resultado:", rows);
    return rows;
  } catch (error) {
    console.error(">>> ERROR en obtenerTutores:", error);
    throw error;
  }
}


// Obtener tutor por ID
export async function obtenerTutorPorId(id) {
  const [rows] = await pool.query(
    "SELECT * FROM tutor WHERE id_tutor = ?",
    [id]
  );
  return rows[0];
}

//crear tutor
export async function crearTutor(data) {
  const { id_tutor, nombres, apellidos, usuario, password_hash } = data;


  if (!id_tutor) throw new Error("id_tutor es obligatorio");

  const [result] = await pool.query(
    `INSERT INTO tutor (id_tutor, nombres, apellidos, usuario, password_hash)
     VALUES (?, ?, ?, ?, ?)`,
    [id_tutor, nombres, apellidos, usuario, password_hash]
  );

  // Ya no usamos insertId, porque el id lo definió el usuario
  return { id_tutor, nombres, apellidos, usuario, password_hash };
}

// Actualizar tutor
export async function actualizarTutor(id, data) {
  const { nombres, apellidos, usuario, password_hash } = data;

  await pool.query(
    `UPDATE tutor SET nombres=?, apellidos=?, usuario=?, password_hash=? 
     WHERE id_tutor=?`,
    [nombres, apellidos, usuario, password_hash, id]
  );

  return { id_tutor: id, ...data };
}

// Eliminar tutor
export async function eliminarTutor(id) {
  await pool.query("DELETE FROM tutor WHERE id_tutor=?", [id]);
  return { mensaje: "Tutor eliminado correctamente" };
}

console.log(">>> tutor.services.js cargado");
