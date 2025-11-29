import pool from "../config/db.js";

console.log(">>> asignacion.services.js cargado");

// --------- Helpers de validación ----------
function validarAsignacion(data, { esCreacion = false } = {}) {
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

  if (!data.fecha_asig) {
    errores.push("fecha_asig es obligatoria (YYYY-MM-DD)");
  } else {
    const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
    if (!regexFecha.test(data.fecha_asig)) {
      errores.push("fecha_asig debe tener formato YYYY-MM-DD");
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

// Verificar si un aula ya tiene tutor asignado
async function existeAsignacionParaAula(id_aula) {
  const [rows] = await pool.query(
    "SELECT id_asignacion FROM relacion_aula_tutor WHERE id_aula = ?",
    [id_aula]
  );
  return rows.length > 0 ? rows[0] : null;
}

// ============= CRUD =============

// LISTAR TODAS
export async function obtenerAsignaciones() {
  const [rows] = await pool.query("SELECT * FROM relacion_aula_tutor");
  return rows;
}

// OBTENER POR ID_ASIGNACION
export async function obtenerAsignacionPorId(id_asignacion) {
  const [rows] = await pool.query(
    "SELECT * FROM relacion_aula_tutor WHERE id_asignacion = ?",
    [id_asignacion]
  );
  return rows[0];
}

// OBTENER POR AULA
export async function obtenerAsignacionPorAula(id_aula) {
  const [rows] = await pool.query(
    "SELECT * FROM relacion_aula_tutor WHERE id_aula = ?",
    [id_aula]
  );
  return rows;
}

// OBTENER POR TUTOR
export async function obtenerAsignacionesPorTutor(id_tutor) {
  const [rows] = await pool.query(
    "SELECT * FROM relacion_aula_tutor WHERE id_tutor = ?",
    [id_tutor]
  );
  return rows;
}

// CREAR (asignar tutor a aula)
export async function crearAsignacion(data) {
  const errores = validarAsignacion(data, { esCreacion: true });
  if (errores.length > 0) {
    const error = new Error(errores.join(", "));
    error.tipo = "VALIDACION";
    throw error;
  }

  const id_aula = Number(data.id_aula);
  const id_tutor = Number(data.id_tutor);
  const fecha_asig = data.fecha_asig;

  // Validar existencia de aula
  if (!(await existeAula(id_aula))) {
    const error = new Error("El aula indicada no existe");
    error.tipo = "VALIDACION";
    throw error;
  }

  // Validar existencia de tutor
  if (!(await existeTutor(id_tutor))) {
    const error = new Error("El tutor indicado no existe");
    error.tipo = "VALIDACION";
    throw error;
  }

  // Verificar si el aula ya tiene un tutor asignado
  const asignacionExistente = await existeAsignacionParaAula(id_aula);
  if (asignacionExistente) {
    const error = new Error(
      "Este aula ya tiene un tutor asignado. Debes registrar un cambio de tutor o eliminar la asignación anterior."
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  const [result] = await pool.query(
    `INSERT INTO relacion_aula_tutor (id_aula, id_tutor, fecha_asig)
     VALUES (?, ?, ?)`,
    [id_aula, id_tutor, fecha_asig]
  );

  return {
    id_asignacion: result.insertId,
    id_aula,
    id_tutor,
    fecha_asig,
  };
}

// ACTUALIZAR
export async function actualizarAsignacion(id_asignacion, data) {
  const errores = validarAsignacion(data, { esCreacion: false });
  if (errores.length > 0) {
    const error = new Error(errores.join(", "));
    error.tipo = "VALIDACION";
    throw error;
  }

  const id_aula = Number(data.id_aula);
  const id_tutor = Number(data.id_tutor);
  const fecha_asig = data.fecha_asig;

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

  await pool.query(
    `UPDATE relacion_aula_tutor
     SET id_aula = ?, id_tutor = ?, fecha_asig = ?
     WHERE id_asignacion = ?`,
    [id_aula, id_tutor, fecha_asig, id_asignacion]
  );

  return {
    id_asignacion: Number(id_asignacion),
    id_aula,
    id_tutor,
    fecha_asig,
  };
}

// ELIMINAR
export async function eliminarAsignacion(id_asignacion) {
  await pool.query(
    "DELETE FROM relacion_aula_tutor WHERE id_asignacion = ?",
    [id_asignacion]
  );
  return { mensaje: "Asignación eliminada correctamente" };
}
