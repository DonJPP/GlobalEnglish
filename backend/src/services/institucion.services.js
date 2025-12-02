import pool from "../config/db.js";

console.log(">>> institucion.services.js cargado");

// <<<<<<<<<<<<<VALIDACIONES>>>>>>>>>>>>>
function validarInstitucion(data) {
  const errores = [];

  if (!data.nombre) errores.push("El nombre es obligatorio");
  if (!data.jornada) errores.push("La jornada es obligatoria");

  const jornadaUpper = String(data.jornada).toUpperCase();
  const jornadasPermitidas = ["MAÑANA", "TARDE", "MIXTA"];

  if (!jornadasPermitidas.includes(jornadaUpper)) {
    errores.push("jornada debe ser 'MAÑANA', 'TARDE' o 'MIXTA'");
  }

  return errores;
}

// ---------- Validación de nombre único ----------
async function existeNombreInstitucion(nombre, excluirId = null) {
  let query = "SELECT id_institucion FROM institucion WHERE nombre = ?";
  let params = [nombre];

  if (excluirId !== null) {
    query += " AND id_institucion != ?";
    params.push(excluirId);
  }

  const [rows] = await pool.query(query, params);
  return rows.length > 0; // true si ya existe
}

// --- LISTAR ---
export async function obtenerInstituciones() {
  const [rows] = await pool.query("SELECT * FROM institucion");
  return rows;
}

// --- OBTENER POR ID ---
export async function obtenerInstitucionPorId(id) {
  const [rows] = await pool.query(
    "SELECT * FROM institucion WHERE id_institucion = ?",
    [id]
  );
  return rows[0];
}

// --- CREAR ---
export async function crearInstitucion(data) {
  const errores = validarInstitucion(data);
  if (errores.length > 0) {
    const error = new Error(errores.join(", "));
    error.tipo = "VALIDACION";
    throw error;
  }

  const nombre = data.nombre.trim();
  const jornada = data.jornada.trim().toUpperCase();

  // Validar nombre único
  if (await existeNombreInstitucion(nombre)) {
    const error = new Error(`Ya existe una institución con el nombre: ${nombre}`);
    error.tipo = "VALIDACION";
    throw error;
  }

  const [result] = await pool.query(
    `INSERT INTO institucion (nombre, jornada)
     VALUES (?, ?)`,
    [nombre, jornada]
  );

  return { id_institucion: result.insertId, nombre, jornada };
}

// --- ACTUALIZAR ---
export async function actualizarInstitucion(id, data) {
  const errores = validarInstitucion(data);
  if (errores.length > 0) {
    const error = new Error(errores.join(", "));
    error.tipo = "VALIDACION";
    throw error;
  }

  const nombre = data.nombre.trim();
  const jornada = data.jornada.trim().toUpperCase();

  // Validar nombre único en actualización
  if (await existeNombreInstitucion(nombre, id)) {
    const error = new Error(
      `Ya existe otra institución con el nombre: ${nombre}`
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  await pool.query(
    `UPDATE institucion 
     SET nombre=?, jornada=?
     WHERE id_institucion=?`,
    [nombre, jornada, id]
  );

  return { id_institucion: id, nombre, jornada };
}

// --- ELIMINAR ---
export async function eliminarInstitucion(id) {
  await pool.query("DELETE FROM institucion WHERE id_institucion = ?", [id]);
  return { mensaje: "Institución eliminada correctamente" };
}
