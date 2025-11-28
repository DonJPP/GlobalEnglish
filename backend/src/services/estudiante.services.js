import pool from "../config/db.js";
import { validarIdUnico } from "../utils/validators.js";

console.log(">>> estudiante.services.js cargado");

function validarEstudiante(data, { esCreacion = false } = {}) {
  const errores = [];

  if (esCreacion && !data.id_estudiante) {
    errores.push("id_estudiante es obligatorio");
  }

  if (!data.nombres) errores.push("nombres es obligatorio");
  if (!data.apellidos) errores.push("apellidos es obligatorio");

  if (data.id_aula !== undefined && data.id_aula !== null) {
    if (isNaN(Number(data.id_aula))) {
      errores.push("id_aula debe ser numérico o null");
    }
  }

  return errores;
}

// LISTAR
export async function obtenerEstudiantes() {
  const [rows] = await pool.query("SELECT * FROM estudiante");
  return rows;
}

// OBTENER POR ID
export async function obtenerEstudiantePorId(id) {
  const [rows] = await pool.query(
    "SELECT * FROM estudiante WHERE id_estudiante = ?",
    [id]
  );
  return rows[0];
}

// CREAR
export async function crearEstudiante(data) {
  const errores = validarEstudiante(data, { esCreacion: true });
  if (errores.length > 0) {
    const error = new Error(errores.join(", "));
    error.tipo = "VALIDACION";
    throw error;
  }

  const {
    id_estudiante,
    nombres,
    apellidos,
    id_aula = null,
  } = data;

  // Validar ID único
  if (await validarIdUnico("estudiante", "id_estudiante", id_estudiante)) {
    const error = new Error("El ID ya existe en estudiante");
    error.tipo = "VALIDACION";
    throw error;
  }

  // Validar que el aula exista si se envía
  if (id_aula !== null) {
    const [aulas] = await pool.query(
      "SELECT no_aula FROM aula WHERE no_aula = ?",
      [id_aula]
    );
    if (aulas.length === 0) {
      const error = new Error("El id_aula no existe");
      error.tipo = "VALIDACION";
      throw error;
    }
  }

  // Insert
  await pool.query(
    `INSERT INTO estudiante (id_estudiante, nombres, apellidos, id_aula)
     VALUES (?, ?, ?, ?)`,
    [id_estudiante, nombres.trim(), apellidos.trim(), id_aula]
  );

  return { id_estudiante, nombres, apellidos, id_aula };
}

// ACTUALIZAR
export async function actualizarEstudiante(id, data) {
  const errores = validarEstudiante(data, { esCreacion: false });
  if (errores.length > 0) {
    const error = new Error(errores.join(", "));
    error.tipo = "VALIDACION";
    throw error;
  }

  const { nombres, apellidos, id_aula = null } = data;

  // Validar que el aula exista
  if (id_aula !== null) {
    const [aulas] = await pool.query(
      "SELECT no_aula FROM aula WHERE no_aula = ?",
      [id_aula]
    );
    if (aulas.length === 0) {
      const error = new Error("El id_aula no existe");
      error.tipo = "VALIDACION";
      throw error;
    }
  }

  await pool.query(
    `UPDATE estudiante 
     SET nombres=?, apellidos=?, id_aula=? 
     WHERE id_estudiante=?`,
    [nombres.trim(), apellidos.trim(), id_aula, id]
  );

  return { id_estudiante: id, nombres, apellidos, id_aula };
}

// ELIMINAR
export async function eliminarEstudiante(id) {
  await pool.query(
    "DELETE FROM estudiante WHERE id_estudiante = ?",
    [id]
  );
  return { mensaje: "Estudiante eliminado correctamente" };
}
