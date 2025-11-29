import pool from "../config/db.js";

console.log(">>> calificaciones.services.js cargado");

// ---------- Helpers de validación ----------
function validarCalificacion(data, { esCreacion = false } = {}) {
  const errores = [];

  if (!data.id_estudiante && data.id_estudiante !== 0) {
    errores.push("id_estudiante es obligatorio");
  } else if (isNaN(Number(data.id_estudiante))) {
    errores.push("id_estudiante debe ser numérico");
  }

  if (!data.fecha) {
    errores.push("fecha es obligatoria (YYYY-MM-DD)");
  } else {
    const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
    if (!regexFecha.test(data.fecha)) {
      errores.push("fecha debe tener formato YYYY-MM-DD");
    }
  }

  if (data.calificacion === undefined || data.calificacion === null) {
    errores.push("calificacion es obligatoria");
  } else if (isNaN(Number(data.calificacion))) {
    errores.push("calificacion debe ser numérica");
  } else {
    const nota = Number(data.calificacion);
    // Ajusta este rango si tu proyecto usa otro
    if (nota < 0 || nota > 5) {
      errores.push("calificacion debe estar entre 0 y 5");
    }
  }

  return errores;
}

// ---------- Helpers BD ----------
async function existeEstudiante(id_estudiante) {
  const [rows] = await pool.query(
    "SELECT id_estudiante FROM estudiante WHERE id_estudiante = ?",
    [id_estudiante]
  );
  return rows.length > 0;
}

// ================== CRUD ==================

// LISTAR TODAS
export async function obtenerCalificaciones() {
  const [rows] = await pool.query("SELECT * FROM calificaciones");
  return rows;
}

// OBTENER POR ID_CALIFICACION
export async function obtenerCalificacionPorId(id_calificacion) {
  const [rows] = await pool.query(
    "SELECT * FROM calificaciones WHERE id_calificacion = ?",
    [id_calificacion]
  );
  return rows[0];
}

// OBTENER HISTORIAL POR ESTUDIANTE (con rango opcional)
export async function obtenerCalificacionesPorEstudiante(
  id_estudiante,
  filtros = {}
) {
  const params = [id_estudiante];
  let query = `
    SELECT * 
    FROM calificaciones
    WHERE id_estudiante = ?
  `;

  if (filtros.desde) {
    query += " AND fecha >= ?";
    params.push(filtros.desde);
  }

  if (filtros.hasta) {
    query += " AND fecha <= ?";
    params.push(filtros.hasta);
  }

  query += " ORDER BY fecha DESC, id_calificacion DESC";

  const [rows] = await pool.query(query, params);
  return rows;
}

// CREAR CALIFICACIÓN
export async function crearCalificacion(data) {
  const errores = validarCalificacion(data, { esCreacion: true });
  if (errores.length > 0) {
    const error = new Error(errores.join(", "));
    error.tipo = "VALIDACION";
    throw error;
  }

  const id_estudiante = Number(data.id_estudiante);
  const fecha = data.fecha;
  const calificacion = Number(data.calificacion);

  // Validar que el estudiante exista
  if (!(await existeEstudiante(id_estudiante))) {
    const error = new Error("El estudiante indicado no existe");
    error.tipo = "VALIDACION";
    throw error;
  }

  const [result] = await pool.query(
    `INSERT INTO calificaciones (fecha, calificacion, id_estudiante)
     VALUES (?, ?, ?)`,
    [fecha, calificacion, id_estudiante]
  );

  return {
    id_calificacion: result.insertId,
    id_estudiante,
    fecha,
    calificacion,
  };
}

// ACTUALIZAR CALIFICACIÓN
export async function actualizarCalificacion(id_calificacion, data) {
  const errores = validarCalificacion(data, { esCreacion: false });
  if (errores.length > 0) {
    const error = new Error(errores.join(", "));
    error.tipo = "VALIDACION";
    throw error;
  }

  const id_estudiante = Number(data.id_estudiante);
  const fecha = data.fecha;
  const calificacion = Number(data.calificacion);

  if (!(await existeEstudiante(id_estudiante))) {
    const error = new Error("El estudiante indicado no existe");
    error.tipo = "VALIDACION";
    throw error;
  }

  await pool.query(
    `UPDATE calificaciones
     SET fecha = ?, calificacion = ?, id_estudiante = ?
     WHERE id_calificacion = ?`,
    [fecha, calificacion, id_estudiante, id_calificacion]
  );

  return {
    id_calificacion: Number(id_calificacion),
    id_estudiante,
    fecha,
    calificacion,
  };
}

// ELIMINAR CALIFICACIÓN
export async function eliminarCalificacion(id_calificacion) {
  await pool.query(
    "DELETE FROM calificaciones WHERE id_calificacion = ?",
    [id_calificacion]
  );
  return { mensaje: "Calificación eliminada correctamente" };
}
