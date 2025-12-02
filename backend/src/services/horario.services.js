import pool from "../config/db.js";

console.log(">>> horario.services.js cargado");

// ----------------- Helpers -----------------
const DIAS_VALIDOS = [
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
];

const MINUTOS_VALIDOS = [40, 45, 50, 55, 60];

function validarHorario(data, { esCreacion = false } = {}) {
  const errores = [];

  if (!data.id_aula && data.id_aula !== 0) {
    errores.push("id_aula es obligatorio");
  } else if (isNaN(Number(data.id_aula))) {
    errores.push("id_aula debe ser numérico");
  }

  if (!data.dia_semana) {
    errores.push("dia_semana es obligatorio");
  } else {
    const diaUpper = String(data.dia_semana).toUpperCase();
    if (!DIAS_VALIDOS.includes(diaUpper)) {
      errores.push(
        "dia_semana debe ser uno de: " + DIAS_VALIDOS.join(", ")
      );
    }
  }

  if (!data.hora_inicio) errores.push("hora_inicio es obligatoria");
  if (!data.hora_fin) errores.push("hora_fin es obligatoria");

  // ----- minutos_equivalentes -----
  if (data.minutos_equivalentes === undefined || data.minutos_equivalentes === null) {
    errores.push("minutos_equivalentes es obligatorio");
  } else if (isNaN(Number(data.minutos_equivalentes))) {
    errores.push("minutos_equivalentes debe ser numérico");
  } else if (!MINUTOS_VALIDOS.includes(Number(data.minutos_equivalentes))) {
    errores.push(
      "minutos_equivalentes debe ser uno de: " + MINUTOS_VALIDOS.join(", ")
    );
  }

  // Validación básica de formato HH:MM
  const regexHora = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (data.hora_inicio && !regexHora.test(data.hora_inicio)) {
    errores.push("hora_inicio debe tener formato HH:MM (24h)");
  }
  if (data.hora_fin && !regexHora.test(data.hora_fin)) {
    errores.push("hora_fin debe tener formato HH:MM (24h)");
  }

  return errores;
}

function diferenciaEnMinutos(horaInicio, horaFin) {
  const [h1, m1] = horaInicio.split(":").map(Number);
  const [h2, m2] = horaFin.split(":").map(Number);
  return (h2 * 60 + m2) - (h1 * 60 + m1);
}

// Obtener info del aula (para validar reglas)
async function obtenerInfoAula(id_aula) {
  const [rows] = await pool.query(
    `SELECT a.id_aula, a.grado, a.programa, s.id_sede, s.id_institucion, i.jornada
     FROM aula a
     JOIN sede s ON a.id_sede = s.id_sede
     JOIN institucion i ON s.id_institucion = i.id_institucion
     WHERE a.id_aula = ?`,
    [id_aula]
  );
  return rows[0];
}

// ----------------- CRUD -----------------

export async function obtenerHorarios() {
  const [rows] = await pool.query("SELECT * FROM horario");
  return rows;
}

export async function obtenerHorarioPorId(id_horario) {
  const [rows] = await pool.query(
    "SELECT * FROM horario WHERE id_horario = ?",
    [id_horario]
  );
  return rows[0];
}

// ---------- CREAR ----------
export async function crearHorario(data) {
  const errores = validarHorario(data, { esCreacion: true });
  if (errores.length > 0) {
    const err = new Error(errores.join(", "));
    err.tipo = "VALIDACION";
    throw err;
  }

  const id_aula = Number(data.id_aula);
  const dia_semana = String(data.dia_semana).toUpperCase();
  const hora_inicio = data.hora_inicio;
  const hora_fin = data.hora_fin;
  const minutos_equivalentes = Number(data.minutos_equivalentes);

  // Validar aula
  const infoAula = await obtenerInfoAula(id_aula);
  if (!infoAula) {
    const error = new Error("El aula indicada no existe");
    error.tipo = "VALIDACION";
    throw error;
  }

  // Validar duración exacta
  const diff = diferenciaEnMinutos(hora_inicio, hora_fin);
  if (diff <= 0) {
    const error = new Error("hora_fin debe ser mayor que hora_inicio");
    error.tipo = "VALIDACION";
    throw error;
  }

  if (diff !== minutos_equivalentes) {
    const error = new Error(
      `La diferencia entre hora_inicio y hora_fin debe ser exactamente ${minutos_equivalentes} minutos`
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  // Reglas de programas:
  const programa = infoAula.programa;

  if (programa === "INSIDECLASSROOM") {
    if (dia_semana === "SABADO") {
      const error = new Error(
        "INSIDECLASSROOM (4° y 5°) no permite horarios en sábado"
      );
      error.tipo = "VALIDACION";
      throw error;
    }
    if (hora_inicio < "06:00" || hora_fin > "18:00") {
      const error = new Error(
        "INSIDECLASSROOM debe tener horario entre 06:00 y 18:00"
      );
      error.tipo = "VALIDACION";
      throw error;
    }
  }

  // TODO: Reglas de OUTSIDECLASSROOM 

  // INSERT
  const [result] = await pool.query(
    `INSERT INTO horario
      (id_aula, dia_semana, hora_inicio, hora_fin, minutos_equivalentes)
     VALUES (?, ?, ?, ?, ?)`,
    [id_aula, dia_semana, hora_inicio, hora_fin, minutos_equivalentes]
  );

  return {
    id_horario: result.insertId,
    id_aula,
    dia_semana,
    hora_inicio,
    hora_fin,
    minutos_equivalentes,
  };
}

// ---------- ACTUALIZAR ----------
export async function actualizarHorario(id_horario, data) {
  const errores = validarHorario(data);
  if (errores.length > 0) {
    const err = new Error(errores.join(", "));
    err.tipo = "VALIDACION";
    throw err;
  }

  const id_aula = Number(data.id_aula);
  const dia_semana = String(data.dia_semana).toUpperCase();
  const hora_inicio = data.hora_inicio;
  const hora_fin = data.hora_fin;
  const minutos_equivalentes = Number(data.minutos_equivalentes);

  const infoAula = await obtenerInfoAula(id_aula);
  if (!infoAula) {
    const error = new Error("El aula indicada no existe");
    error.tipo = "VALIDACION";
    throw error;
  }

  const diff = diferenciaEnMinutos(hora_inicio, hora_fin);
  if (diff !== minutos_equivalentes) {
    const error = new Error(
      `La diferencia entre hora_inicio y hora_fin debe ser exactamente ${minutos_equivalentes} minutos`
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  const programa = infoAula.programa;

  if (programa === "INSIDECLASSROOM") {
    if (dia_semana === "SABADO") {
      const error = new Error("INSIDECLASSROOM no permite sábado");
      error.tipo = "VALIDACION";
      throw error;
    }
    if (hora_inicio < "06:00" || hora_fin > "18:00") {
      const error = new Error(
        "INSIDECLASSROOM debe ir entre 06:00 y 18:00"
      );
      error.tipo = "VALIDACION";
      throw error;
    }
  }

  await pool.query(
    `UPDATE horario
     SET id_aula = ?, dia_semana = ?, hora_inicio = ?, hora_fin = ?, minutos_equivalentes = ?
     WHERE id_horario = ?`,
    [id_aula, dia_semana, hora_inicio, hora_fin, minutos_equivalentes, id_horario]
  );

  return {
    id_horario: Number(id_horario),
    id_aula,
    dia_semana,
    hora_inicio,
    hora_fin,
    minutos_equivalentes,
  };
}

export async function eliminarHorario(id_horario) {
  await pool.query("DELETE FROM horario WHERE id_horario = ?", [id_horario]);
  return { mensaje: "Horario eliminado correctamente" };
}
