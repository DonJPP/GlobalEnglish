import pool from "../config/db.js";
import { validarIdUnico } from "../utils/validators.js";

console.log(">>> tutor.services.js cargado");

function validarTutor(data, { esCreacion = false } = {}) {
  const errores = [];

  if (esCreacion && !data.id_tutor) {
    errores.push("id_tutor es obligatorio");
  }

  if (!data.nombres) errores.push("nombres es obligatorio");
  if (!data.apellidos) errores.push("apellidos es obligatorio");
  if (!data.usuario) errores.push("usuario es obligatorio");
  if (!data.password_hash) errores.push("password_hash es obligatorio");

  return errores;
}

// LISTAR
export async function obtenerTutores() {
  const [rows] = await pool.query("SELECT * FROM tutor");
  return rows;
}

// OBTENER POR ID
export async function obtenerTutorPorId(id) {
  const [rows] = await pool.query(
    "SELECT * FROM tutor WHERE id_tutor = ?",
    [id]
  );
  return rows[0];
}

// CREAR
export async function crearTutor(data) {
  const errores = validarTutor(data, { esCreacion: true });
  if (errores.length > 0) {
    const error = new Error(errores.join(", "));
    error.tipo = "VALIDACION";
    throw error;
  }

  const {
    id_tutor,
    nombres,
    apellidos,
    usuario,
    password_hash,
  } = data;

  // Validar ID único
  if (await validarIdUnico("tutor", "id_tutor", id_tutor)) {
    const error = new Error("El ID ya existe en tutor");
    error.tipo = "VALIDACION";
    throw error;
  }

  await pool.query(
    `INSERT INTO tutor (id_tutor, nombres, apellidos, usuario, password_hash)
     VALUES (?, ?, ?, ?, ?)`,
    [
      id_tutor,
      nombres.trim(),
      apellidos.trim(),
      usuario.trim(),
      password_hash,
    ]
  );

  return {
    id_tutor,
    nombres,
    apellidos,
    usuario,
    password_hash,
  };
}

// ACTUALIZAR
export async function actualizarTutor(id, data) {
  const errores = validarTutor(data, { esCreacion: false });
  if (errores.length > 0) {
    const error = new Error(errores.join(", "));
    error.tipo = "VALIDACION";
    throw error;
  }

  const { nombres, apellidos, usuario, password_hash } = data;

  await pool.query(
    `UPDATE tutor
     SET nombres=?, apellidos=?, usuario=?, password_hash=?
     WHERE id_tutor=?`,
    [
      nombres.trim(),
      apellidos.trim(),
      usuario.trim(),
      password_hash,
      id,
    ]
  );

  return { id_tutor: id, ...data };
}

// ELIMINAR
export async function eliminarTutor(id) {
  await pool.query(
    "DELETE FROM tutor WHERE id_tutor = ?",
    [id]
  );
  return { mensaje: "Tutor eliminado correctamente" };
}
