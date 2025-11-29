// GLOBALENGLISH/backend/src/services/asistenciaTutor.services.js
import pool from "../config/db.js";

console.log(">>> asistenciaTutor.services.js cargado");

// ---------- Helpers de validación ----------
function validarAsistenciaTutor(data, { esCreacion = false } = {}) {
  const errores = [];

  if (!data.id_aula && data.id_aula !== 0) {
    errores.push("id_aula es obligatorio");
  } else if (isNaN(Number(data.id_aula))) {
    errores.push("id_aula debe ser numérico");
  }

  if (!data.id_tutor && data.id_tutor !== 0) {
    errores.push("id_tutor es obligatorio");
  } else if (isNaN(Number(data.id_tutor))) {
    errores.push("id_tutor debe ser numérico");
  }

  if (!data.fecha) {
    errores.push("fecha es obligatoria (YYYY-MM-DD)");
  } else {
    const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
    if (!regexFecha.test(data.fecha)) {
      errores.push("fecha debe tener formato YYYY-MM-DD");
    }
  }

  return errores;
}

// Verificar que aula exista
async function existeAula(id_aula) {
  const [rows] = await pool.query(
    "SELECT id_aula FROM aula WHERE id_aula = ?",
    [id_aula]
  );
  return rows.length > 0;
}

// Verificar que tutor exista
async function existeTutor(id_tutor) {
  const [rows] = await pool.query(
    "SELECT id_tutor FROM tutor WHERE id_tutor = ?",
    [id_tutor]
  );
  return rows.length > 0;
}

// Obtener relación actual aula-tutor
async function obtenerRelacionAulaTutor(id_aula) {
  const [rows] = await pool.query(
    "SELECT * FROM relacion_aula_tutor WHERE id_aula = ?",
    [id_aula]
  );
  return rows[0]; // puede ser undefined
}

// Verificar si ya hay asistencia para esa combinación
async function existeAsistenciaEnFecha(id_aula, id_tutor, fecha) {
  const [rows] = await pool.query(
    `SELECT id_asistencia 
       FROM asistencia_tutor 
      WHERE id_aula = ? AND id_tutor = ? AND fecha = ?`,
    [id_aula, id_tutor, fecha]
  );
  return rows.length > 0;
}

// ================== CRUD ==================

// LISTAR TODAS
export async function obtenerAsistenciasTutor() {
  const [rows] = await pool.query("SELECT * FROM asistencia_tutor");
  return rows;
}

// OBTENER POR ID
export async function obtenerAsistenciaTutorPorId(id_asistencia) {
  const [rows] = await pool.query(
    "SELECT * FROM asistencia_tutor WHERE id_asistencia = ?",
    [id_asistencia]
  );
  return rows[0];
}

// OBTENER POR TUTOR (opcionalmente por rango de fechas)
export async function obtenerAsistenciasPorTutor(id_tutor, filtros = {}) {
  const params = [id_tutor];
  let query = `
    SELECT * 
    FROM asistencia_tutor
    WHERE id_tutor = ?
  `;

  if (filtros.desde) {
    query += " AND fecha >= ?";
    params.push(filtros.desde);
  }

  if (filtros.hasta) {
    query += " AND fecha <= ?";
    params.push(filtros.hasta);
  }

  query += " ORDER BY fecha DESC";

  const [rows] = await pool.query(query, params);
  return rows;
}

// OBTENER POR AULA
export async function obtenerAsistenciasPorAula(id_aula) {
  const [rows] = await pool.query(
    "SELECT * FROM asistencia_tutor WHERE id_aula = ? ORDER BY fecha DESC",
    [id_aula]
  );
  return rows;
}

// CREAR REGISTRO DE ASISTENCIA
export async function crearAsistenciaTutor(data) {
  const errores = validarAsistenciaTutor(data, { esCreacion: true });
  if (errores.length > 0) {
    const error = new Error(errores.join(", "));
    error.tipo = "VALIDACION";
    throw error;
  }

  const id_aula = Number(data.id_aula);
  const id_tutor = Number(data.id_tutor);
  const fecha = data.fecha;

  // Validar existencia
  if (!(await existeAula(id_aula))) {
    const error = new Error("El aula indicada no existe");
    error.tipo = "VALIDACION";
    throw error;
  }

  if (!(await existeTutor(id_tutor))) {
    const error = new Error("El tutor indicado no existe");
    error.tipo = "VALIDACION";
    throw error;
  }

  // Validar relación aula-tutor actual
  const relacion = await obtenerRelacionAulaTutor(id_aula);
  if (!relacion) {
    const error = new Error(
      "El aula no tiene un tutor asignado en relacion_aula_tutor"
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  if (Number(relacion.id_tutor) !== id_tutor) {
    const error = new Error(
      `El tutor indicado (id_tutor=${id_tutor}) no coincide con el tutor asignado actualmente al aula (id_tutor=${relacion.id_tutor}).`
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  // Evitar duplicar asistencia para misma fecha/aula/tutor
  if (await existeAsistenciaEnFecha(id_aula, id_tutor, fecha)) {
    const error = new Error(
      "Ya existe un registro de asistencia para este tutor, aula y fecha."
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  // Insertar
  const [result] = await pool.query(
    `INSERT INTO asistencia_tutor (id_aula, id_tutor, fecha)
     VALUES (?, ?, ?)`,
    [id_aula, id_tutor, fecha]
  );

  return {
    id_asistencia: result.insertId,
    id_aula,
    id_tutor,
    fecha,
  };
}

// ACTUALIZAR (en caso de correcciones)
export async function actualizarAsistenciaTutor(id_asistencia, data) {
  const errores = validarAsistenciaTutor(data, { esCreacion: false });
  if (errores.length > 0) {
    const error = new Error(errores.join(", "));
    error.tipo = "VALIDACION";
    throw error;
  }

  const id_aula = Number(data.id_aula);
  const id_tutor = Number(data.id_tutor);
  const fecha = data.fecha;

  if (!(await existeAula(id_aula))) {
    const error = new Error("El aula indicada no existe");
    error.tipo = "VALIDACION";
    throw error;
  }

  if (!(await existeTutor(id_tutor))) {
    const error = new Error("El tutor indicado no existe");
    error.tipo = "VALIDACION";
    throw error;
  }

  // Validar relación aula-tutor vigente
  const relacion = await obtenerRelacionAulaTutor(id_aula);
  if (!relacion) {
    const error = new Error(
      "El aula no tiene un tutor asignado en relacion_aula_tutor"
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  if (Number(relacion.id_tutor) !== id_tutor) {
    const error = new Error(
      `El tutor indicado no coincide con el tutor asignado actualmente al aula.`
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  await pool.query(
    `UPDATE asistencia_tutor
     SET id_aula = ?, id_tutor = ?, fecha = ?
     WHERE id_asistencia = ?`,
    [id_aula, id_tutor, fecha, id_asistencia]
  );

  return {
    id_asistencia: Number(id_asistencia),
    id_aula,
    id_tutor,
    fecha,
  };
}

// ELIMINAR
export async function eliminarAsistenciaTutor(id_asistencia) {
  await pool.query(
    "DELETE FROM asistencia_tutor WHERE id_asistencia = ?",
    [id_asistencia]
  );
  return { mensaje: "Asistencia de tutor eliminada correctamente" };
}