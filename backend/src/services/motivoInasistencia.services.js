import pool from "../config/db.js";

console.log(">>> motivoInasistencia.services.js cargado");

function validarMotivo(data, { esCreacion = false } = {}) {
  const errores = [];

  if (!data.razon || !data.razon.trim()) {
    errores.push("La razón del motivo es obligatoria");
  } else if (data.razon.length > 50) {
    errores.push("La razón no puede superar 50 caracteres");
  }

  return errores;
}

// LISTAR TODOS
export async function obtenerMotivos() {
  const [rows] = await pool.query("SELECT * FROM motivo_inasistencia");
  return rows;
}

// OBTENER POR ID
export async function obtenerMotivoPorId(id_motivo) {
  const [rows] = await pool.query(
    "SELECT * FROM motivo_inasistencia WHERE id_motivo = ?",
    [id_motivo]
  );
  return rows[0];
}

// CREAR
export async function crearMotivo(data) {
  const errores = validarMotivo(data, { esCreacion: true });
  if (errores.length > 0) {
    const error = new Error(errores.join(", "));
    error.tipo = "VALIDACION";
    throw error;
  }

  const razon = data.razon.trim();

  const [result] = await pool.query(
    "INSERT INTO motivo_inasistencia (razon) VALUES (?)",
    [razon]
  );

  return { id_motivo: result.insertId, razon };
}

// ACTUALIZAR
export async function actualizarMotivo(id_motivo, data) {
  const errores = validarMotivo(data);
  if (errores.length > 0) {
    const error = new Error(errores.join(", "));
    error.tipo = "VALIDACION";
    throw error;
  }

  const razon = data.razon.trim();

  await pool.query(
    "UPDATE motivo_inasistencia SET razon = ? WHERE id_motivo = ?",
    [razon, id_motivo]
  );

  return { id_motivo: Number(id_motivo), razon };
}

// ELIMINAR
export async function eliminarMotivo(id_motivo) {
  await pool.query(
    "DELETE FROM motivo_inasistencia WHERE id_motivo = ?",
    [id_motivo]
  );
  return { mensaje: "Motivo de inasistencia eliminado correctamente" };
}
