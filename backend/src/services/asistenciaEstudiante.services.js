import pool from "../config/db.js";

console.log(">>> asistenciaEstudiante.services.js cargado");

// ---------- Helpers de validación ----------
function validarAsistenciaEstudiante(data, { esCreacion = false } = {}) {
  const errores = [];

  if (!data.id_aula && data.id_aula !== 0) {
    errores.push("id_aula es obligatorio");
  } else if (isNaN(Number(data.id_aula))) {
    errores.push("id_aula debe ser numérico");
  }

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

  return errores;
}

// ---------- Helpers BD ----------

async function existeAula(id_aula) {
  const [rows] = await pool.query(
    "SELECT id_aula FROM aula WHERE id_aula = ?",
    [id_aula]
  );
  return rows.length > 0;
}

async function existeEstudiante(id_estudiante) {
  const [rows] = await pool.query(
    "SELECT id_estudiante, id_aula FROM estudiante WHERE id_estudiante = ?",
    [id_estudiante]
  );
  return rows[0]; // puede devolver {id_estudiante, id_aula} o undefined
}

async function existeAsistenciaEnFecha(id_aula, id_estudiante, fecha) {
  const [rows] = await pool.query(
    `SELECT id_asistencia 
       FROM asistencia_estudiante 
      WHERE id_aula = ? AND id_estudiante = ? AND fecha = ?`,
    [id_aula, id_estudiante, fecha]
  );
  return rows.length > 0;
}

// Obtener día de la semana a partir de la fecha dada
function obtenerDiaSemana(fecha) {
  // fecha viene en formato YYYY-MM-DD
  const d = new Date(fecha + "T00:00:00");
  const dias = [
    "DOMINGO",
    "LUNES",
    "MARTES",
    "MIERCOLES",
    "JUEVES",
    "VIERNES",
    "SABADO",
  ];
  const idx = d.getDay(); // 0=Domingo, 6=Sabado en horario local
  return dias[idx];
}

// Verificar si el aula tiene algún horario ese día
async function aulaTieneHorarioEnDia(id_aula, dia_semana) {
  const [rows] = await pool.query(
    `
    SELECT id_horario
      FROM horario
     WHERE id_aula = ?
       AND dia_semana = ?
    LIMIT 1
    `,
    [id_aula, dia_semana]
  );
  return rows.length > 0;
}

// ================== CRUD ==================

export async function obtenerAsistenciasEstudiante() {
  const [rows] = await pool.query("SELECT * FROM asistencia_estudiante");
  return rows;
}

export async function obtenerAsistenciaEstudiantePorId(id_asistencia) {
  const [rows] = await pool.query(
    "SELECT * FROM asistencia_estudiante WHERE id_asistencia = ?",
    [id_asistencia]
  );
  return rows[0];
}

export async function obtenerAsistenciasPorEstudiante(
  id_estudiante,
  filtros = {}
) {
  const params = [id_estudiante];
  let query = `
    SELECT * 
    FROM asistencia_estudiante
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

  query += " ORDER BY fecha DESC";

  const [rows] = await pool.query(query, params);
  return rows;
}

export async function obtenerAsistenciasPorAula(id_aula) {
  const [rows] = await pool.query(
    "SELECT * FROM asistencia_estudiante WHERE id_aula = ? ORDER BY fecha DESC",
    [id_aula]
  );
  return rows;
}

// CREAR REGISTRO DE ASISTENCIA
export async function crearAsistenciaEstudiante(data) {
  const errores = validarAsistenciaEstudiante(data, { esCreacion: true });
  if (errores.length > 0) {
    const error = new Error(errores.join(", "));
    error.tipo = "VALIDACION";
    throw error;
  }

  const id_aula = Number(data.id_aula);
  const id_estudiante = Number(data.id_estudiante);
  const fecha = data.fecha;

  // Validar aula
  if (!(await existeAula(id_aula))) {
    const error = new Error("El aula indicada no existe");
    error.tipo = "VALIDACION";
    throw error;
  }

  // Validar estudiante y su aula actual
  const infoEst = await existeEstudiante(id_estudiante);
  if (!infoEst) {
    const error = new Error("El estudiante indicado no existe");
    error.tipo = "VALIDACION";
    throw error;
  }

  // Validar que el estudiante pertenezca a esa aula actualmente
  if (infoEst.id_aula === null) {
    const error = new Error(
      "El estudiante no está asociado actualmente a ningún aula (id_aula es NULL)"
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  if (Number(infoEst.id_aula) !== id_aula) {
    const error = new Error(
      `El estudiante no pertenece al aula indicada. Aula del estudiante: ${infoEst.id_aula}, aula solicitada: ${id_aula}.`
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  // Validar día de la semana
  const dia_semana = obtenerDiaSemana(fecha); // DOMINGO, LUNES, ...

  // Bloquear siempre el domingo
  if (dia_semana === "DOMINGO") {
    const error = new Error(
      "No se puede registrar asistencia en día DOMINGO; el programa no dicta clases ese día."
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  // Validar que el aula tenga horario ese día
  const tieneHorario = await aulaTieneHorarioEnDia(id_aula, dia_semana);
  if (!tieneHorario) {
    const error = new Error(
      `El aula ${id_aula} no tiene horario programado para el día ${dia_semana}. Registre la asistencia en un día donde el aula tenga horario asignado.`
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  // Evitar duplicados de asistencia para el mismo día / aula / estudiante
  if (await existeAsistenciaEnFecha(id_aula, id_estudiante, fecha)) {
    const error = new Error(
      "Ya existe un registro de asistencia para este estudiante, aula y fecha."
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  // Insertar
  const [result] = await pool.query(
    `INSERT INTO asistencia_estudiante (id_aula, id_estudiante, fecha)
     VALUES (?, ?, ?)`,
    [id_aula, id_estudiante, fecha]
  );

  return {
    id_asistencia: result.insertId,
    id_aula,
    id_estudiante,
    fecha,
  };
}

// ACTUALIZAR (para correcciones)
export async function actualizarAsistenciaEstudiante(id_asistencia, data) {
  const errores = validarAsistenciaEstudiante(data, { esCreacion: false });
  if (errores.length > 0) {
    const error = new Error(errores.join(", "));
    error.tipo = "VALIDACION";
    throw error;
  }

  const id_aula = Number(data.id_aula);
  const id_estudiante = Number(data.id_estudiante);
  const fecha = data.fecha;

  if (!(await existeAula(id_aula))) {
    const error = new Error("El aula indicada no existe");
    error.tipo = "VALIDACION";
    throw error;
  }

  const infoEst = await existeEstudiante(id_estudiante);
  if (!infoEst) {
    const error = new Error("El estudiante indicado no existe");
    error.tipo = "VALIDACION";
    throw error;
  }

  if (infoEst.id_aula === null) {
    const error = new Error(
      "El estudiante no está asociado actualmente a ningún aula (id_aula es NULL)"
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  if (Number(infoEst.id_aula) !== id_aula) {
    const error = new Error(
      "El estudiante no pertenece al aula indicada según su id_aula actual."
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  const dia_semana = obtenerDiaSemana(fecha);

  if (dia_semana === "DOMINGO") {
    const error = new Error(
      "No se puede actualizar la asistencia a un día DOMINGO; el programa no dicta clases ese día."
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  const tieneHorario = await aulaTieneHorarioEnDia(id_aula, dia_semana);
  if (!tieneHorario) {
    const error = new Error(
      `El aula ${id_aula} no tiene horario programado para el día ${dia_semana}. No se puede actualizar la asistencia a una fecha sin horario.`
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  await pool.query(
    `UPDATE asistencia_estudiante
     SET id_aula = ?, id_estudiante = ?, fecha = ?
     WHERE id_asistencia = ?`,
    [id_aula, id_estudiante, fecha, id_asistencia]
  );

  return {
    id_asistencia: Number(id_asistencia),
    id_aula,
    id_estudiante,
    fecha,
  };
}

