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

  if (!data.asistio) {
    errores.push("asistio es obligatorio (SI/NO)");
  } else {
    const a = String(data.asistio).toUpperCase();
    if (!["SI", "NO"].includes(a)) {
      errores.push("asistio debe ser 'SI' o 'NO'");
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

async function existeTutor(id_tutor) {
  const [rows] = await pool.query(
    "SELECT id_tutor FROM tutor WHERE id_tutor = ?",
    [id_tutor]
  );
  return rows.length > 0;
}

async function obtenerRelacionAulaTutor(id_aula) {
  const [rows] = await pool.query(
    "SELECT * FROM relacion_aula_tutor WHERE id_aula = ?",
    [id_aula]
  );
  return rows[0];
}

async function existeAsistenciaEnFecha(id_aula, id_tutor, fecha) {
  const [rows] = await pool.query(
    `SELECT id_asistencia 
       FROM asistencia_tutor 
      WHERE id_aula = ? AND id_tutor = ? AND fecha = ?`,
    [id_aula, id_tutor, fecha]
  );
  return rows.length > 0;
}

async function existeMotivo(id_motivo) {
  const [rows] = await pool.query(
    "SELECT id_motivo FROM motivo_inasistencia WHERE id_motivo = ?",
    [id_motivo]
  );
  return rows.length > 0;
}

// Obtener día de la semana a partir de la fecha dada
function obtenerDiaSemana(fecha) {
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

export async function obtenerAsistenciasTutor() {
  const [rows] = await pool.query("SELECT * FROM asistencia_tutor");
  return rows;
}

export async function obtenerAsistenciaTutorPorId(id_asistencia) {
  const [rows] = await pool.query(
    "SELECT * FROM asistencia_tutor WHERE id_asistencia = ?",
    [id_asistencia]
  );
  return rows[0];
}

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

export async function obtenerAsistenciasPorAula(id_aula) {
  const [rows] = await pool.query(
    "SELECT * FROM asistencia_tutor WHERE id_aula = ? ORDER BY fecha DESC",
    [id_aula]
  );
  return rows;
}

// CREAR
export async function crearAsistenciaTutor(data) {
  const errores = validarAsistenciaTutor(data, { esCreacion: true });
  if (errores.length > 0) {
    const err = new Error(errores.join(", "));
    err.tipo = "VALIDACION";
    throw err;
  }

  const id_aula = Number(data.id_aula);
  const id_tutor = Number(data.id_tutor);
  const fecha = data.fecha;
  const asistio = String(data.asistio).toUpperCase();
  const id_motivo =
    data.id_motivo !== undefined && data.id_motivo !== null
      ? Number(data.id_motivo)
      : null;

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

  const dia_semana = obtenerDiaSemana(fecha);

  if (dia_semana === "DOMINGO") {
    const error = new Error(
      "No se puede registrar asistencia en día DOMINGO; el programa no dicta clases ese día."
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  const tieneHorario = await aulaTieneHorarioEnDia(id_aula, dia_semana);
  if (!tieneHorario) {
    const error = new Error(
      `El aula ${id_aula} no tiene horario programado para el día ${dia_semana}. Registre la asistencia en un día donde el aula tenga horario asignado.`
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  // Motivo según asistio
  if (asistio === "NO") {
    if (!id_motivo) {
      const error = new Error(
        "id_motivo es obligatorio cuando asistio = 'NO'"
      );
      error.tipo = "VALIDACION";
      throw error;
    }
    if (isNaN(id_motivo) || !(await existeMotivo(id_motivo))) {
      const error = new Error("El motivo de inasistencia indicado no existe");
      error.tipo = "VALIDACION";
      throw error;
    }
  }

  if (await existeAsistenciaEnFecha(id_aula, id_tutor, fecha)) {
    const error = new Error(
      "Ya existe un registro de asistencia para este tutor, aula y fecha."
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  const [result] = await pool.query(
    `INSERT INTO asistencia_tutor 
       (id_aula, id_tutor, fecha, asistio, id_motivo)
     VALUES (?, ?, ?, ?, ?)`,
    [id_aula, id_tutor, fecha, asistio, id_motivo]
  );

  return {
    id_asistencia: result.insertId,
    id_aula,
    id_tutor,
    fecha,
    asistio,
    id_motivo,
  };
}

// ACTUALIZAR
export async function actualizarAsistenciaTutor(id_asistencia, data) {
  const errores = validarAsistenciaTutor(data, { esCreacion: false });
  if (errores.length > 0) {
    const err = new Error(errores.join(", "));
    err.tipo = "VALIDACION";
    throw err;
  }

  const id_aula = Number(data.id_aula);
  const id_tutor = Number(data.id_tutor);
  const fecha = data.fecha;
  const asistio = String(data.asistio).toUpperCase();
  const id_motivo =
    data.id_motivo !== undefined && data.id_motivo !== null
      ? Number(data.id_motivo)
      : null;

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
      "El tutor indicado no coincide con el tutor asignado actualmente al aula."
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

  if (asistio === "NO") {
    if (!id_motivo) {
      const error = new Error(
        "id_motivo es obligatorio cuando asistio = 'NO'"
      );
      error.tipo = "VALIDACION";
      throw error;
    }
    if (isNaN(id_motivo) || !(await existeMotivo(id_motivo))) {
      const error = new Error("El motivo de inasistencia indicado no existe");
      error.tipo = "VALIDACION";
      throw error;
    }
  }

  await pool.query(
    `UPDATE asistencia_tutor
     SET id_aula = ?, id_tutor = ?, fecha = ?, asistio = ?, id_motivo = ?
     WHERE id_asistencia = ?`,
    [id_aula, id_tutor, fecha, asistio, id_motivo, id_asistencia]
  );

  return {
    id_asistencia: Number(id_asistencia),
    id_aula,
    id_tutor,
    fecha,
    asistio,
    id_motivo,
  };
}

export async function eliminarAsistenciaTutor(id_asistencia) {
  await pool.query(
    "DELETE FROM asistencia_tutor WHERE id_asistencia = ?",
    [id_asistencia]
  );
  return { mensaje: "Asistencia de tutor eliminada correctamente" };
}
