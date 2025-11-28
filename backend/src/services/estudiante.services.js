import pool from "../config/db.js";

console.log(">>> estudiante.services.js cargado");

// Obtener lista de estudiantes
export async function obtenerEstudiantes() {
  const [rows] = await pool.query("SELECT * FROM estudiante");
  return rows;
}

// Obtener estudiante por ID
export async function obtenerEstudiantePorId(id) {
  const [rows] = await pool.query(
    "SELECT * FROM estudiante WHERE id_estudiante = ?",
    [id]
  );
  return rows[0];
}

// Crear estudiante
export async function crearEstudiante(data) {
  // id_aula es opcional, si no viene en el body, se pone en null
  const { id_estudiante, nombres, apellidos, id_aula = null } = data;

  const [result] = await pool.query(
    `INSERT INTO estudiante (id_estudiante, nombres, apellidos, id_aula)
     VALUES (?, ?, ?, ?)`,
    [id_estudiante, nombres, apellidos, id_aula]
  );

  return { id_estudiante, nombres, apellidos, id_aula };
}


// Actualizar estudiante
export async function actualizarEstudiante(id, data) {
  const { nombres, apellidos, id_aula } = data;

  await pool.query(
    `UPDATE estudiante 
     SET nombres = ?, apellidos = ?, id_aula = ?
     WHERE id_estudiante = ?`,
    [nombres, apellidos, id_aula, id]
  );

  return { id_estudiante: id, ...data };
}

// Eliminar estudiante
export async function eliminarEstudiante(id) {
  await pool.query("DELETE FROM estudiante WHERE id_estudiante = ?", [id]);
  return { mensaje: "Estudiante eliminado correctamente" };
}
