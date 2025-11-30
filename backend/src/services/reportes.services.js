// GLOBALENGLISH/backend/src/services/reportes.services.js
import pool from "../config/db.js";

console.log(">>> reportes.services.js cargado");

/**
 * Reporte de asistencia por AULA (por IED)
 * Filtros:
 *  - id_institucion (opcional)
 *  - id_aula (opcional)
 *  - desde (YYYY-MM-DD)
 *  - hasta (YYYY-MM-DD)
 */
export async function reporteAsistenciaAula({ id_institucion, id_aula, desde, hasta }) {
  if (!desde || !hasta) {
    const err = new Error("Los parámetros 'desde' y 'hasta' son obligatorios (YYYY-MM-DD).");
    err.tipo = "VALIDACION";
    throw err;
  }

  const params = [desde, hasta];
  let where = "at.fecha BETWEEN ? AND ?";

  if (id_institucion) {
    where += " AND i.id_institucion = ?";
    params.push(Number(id_institucion));
  }

  if (id_aula) {
    where += " AND a.id_aula = ?";
    params.push(Number(id_aula));
  }

  const [rows] = await pool.query(
    `
    SELECT
      i.id_institucion,
      i.nombre        AS institucion,
      a.id_aula,
      a.grado,
      a.programa,
      s.id_sede,
      s.direccion_completa,
      at.id_asistencia,
      at.fecha,
      at.asistio,
      at.id_tutor,
      t.nombres       AS tutor_nombres,
      t.apellidos     AS tutor_apellidos,
      h.dia_semana,
      h.hora_inicio,
      h.hora_fin,
      h.minutos_equivalentes,
      mi.razon        AS motivo_inasistencia,
      fr.fecha        AS fecha_reposicion
      -- Aquí en el futuro se puede hacer LEFT JOIN festivo si creas esa tabla
    FROM asistencia_tutor at
    JOIN aula a            ON a.id_aula        = at.id_aula
    JOIN sede s            ON s.id_sede        = a.id_sede
    JOIN institucion i     ON i.id_institucion = s.id_institucion
    LEFT JOIN tutor t      ON t.id_tutor       = at.id_tutor
    LEFT JOIN horario h    ON h.id_aula        = a.id_aula
    LEFT JOIN motivo_inasistencia mi ON mi.id_motivo = at.id_motivo
    LEFT JOIN fecha_reposicion fr    ON fr.id_asistencia = at.id_asistencia
    WHERE ${where}
    ORDER BY i.nombre, a.id_aula, at.fecha, h.hora_inicio
    `,
    params
  );

  // Enriquecer un poquito con horas dictadas/no dictadas (1 por registro)
  const resultado = rows.map((r) => {
    const horasDictadas = r.asistio === "SI" ? 1 : 0;
    const horasNoDictadas = r.asistio === "NO" ? 1 : 0;

    return {
      ...r,
      horas_dictadas: horasDictadas,
      horas_no_dictadas: horasNoDictadas,
      // es_festivo: false  // lo puedes calcular cuando tengas tabla festivo
    };
  });

  return resultado;
}

/**
 * Reporte de asistencia por ESTUDIANTE
 * - id_estudiante (obligatorio)
 * - desde / hasta (opcionales)
 *
 * Trae la asistencia del estudiante y, además,
 * si la clase fue dictada o no (usando asistencia_tutor).
 */
export async function reporteAsistenciaEstudiante({ id_estudiante, desde, hasta }) {
  if (!id_estudiante) {
    const err = new Error("id_estudiante es obligatorio");
    err.tipo = "VALIDACION";
    throw err;
  }

  const params = [Number(id_estudiante)];
  let where = "ae.id_estudiante = ?";

  if (desde) {
    where += " AND ae.fecha >= ?";
    params.push(desde);
  }

  if (hasta) {
    where += " AND ae.fecha <= ?";
    params.push(hasta);
  }

  const [rows] = await pool.query(
    `
    SELECT
      i.id_institucion,
      i.nombre                AS institucion,
      a.id_aula,
      a.grado,
      a.programa,
      e.id_estudiante,
      e.nombres               AS estudiante_nombres,
      e.apellidos             AS estudiante_apellidos,
      ae.id_asistencia        AS id_asistencia_est,
      ae.fecha,
      at.id_asistencia        AS id_asistencia_tutor,
      at.asistio              AS clase_dictada,
      t.id_tutor,
      t.nombres               AS tutor_nombres,
      t.apellidos             AS tutor_apellidos,
      h.dia_semana,
      h.hora_inicio,
      h.hora_fin,
      h.minutos_equivalentes
    FROM asistencia_estudiante ae
    JOIN estudiante e    ON e.id_estudiante = ae.id_estudiante
    JOIN aula a          ON a.id_aula       = ae.id_aula
    JOIN sede s          ON s.id_sede       = a.id_sede
    JOIN institucion i   ON i.id_institucion = s.id_institucion
    LEFT JOIN asistencia_tutor at
           ON at.id_aula = ae.id_aula
          AND at.fecha   = ae.fecha
    LEFT JOIN tutor t    ON t.id_tutor      = at.id_tutor
    LEFT JOIN horario h  ON h.id_aula       = a.id_aula
    WHERE ${where}
    ORDER BY ae.fecha, h.hora_inicio
    `,
    params
  );

  return rows;
}

/**
 * Reporte de NOTAS de un estudiante (boletín simplificado)
 * - id_estudiante obligatorio
 * - desde / hasta (rango de fechas opcional)
 *
 * Devuelve info del estudiante, aula, institución y sus calificaciones
 * en el rango, más el promedio.
 */
export async function reporteNotasEstudiante({ id_estudiante, desde, hasta }) {
  if (!id_estudiante) {
    const err = new Error("id_estudiante es obligatorio");
    err.tipo = "VALIDACION";
    throw err;
  }

  const params = [Number(id_estudiante)];
  let where = "c.id_estudiante = ?";

  if (desde) {
    where += " AND c.fecha >= ?";
    params.push(desde);
  }

  if (hasta) {
    where += " AND c.fecha <= ?";
    params.push(hasta);
  }

  const [rows] = await pool.query(
    `
    SELECT
      i.id_institucion,
      i.nombre          AS institucion,
      a.id_aula,
      a.grado,
      a.programa,
      e.id_estudiante,
      e.nombres         AS estudiante_nombres,
      e.apellidos       AS estudiante_apellidos,
      c.id_calificacion,
      c.fecha,
      c.calificacion
    FROM calificaciones c
    JOIN estudiante e  ON e.id_estudiante = c.id_estudiante
    JOIN aula a        ON a.id_aula       = e.id_aula
    JOIN sede s        ON s.id_sede       = a.id_sede
    JOIN institucion i ON i.id_institucion = s.id_institucion
    WHERE ${where}
    ORDER BY c.fecha
    `,
    params
  );

  if (rows.length === 0) {
    return {
      meta: {
        id_estudiante: Number(id_estudiante),
        tiene_notas: false,
      },
      calificaciones: [],
    };
  }

  const estudianteBase = {
    id_estudiante: rows[0].id_estudiante,
    nombres: rows[0].estudiante_nombres,
    apellidos: rows[0].estudiante_apellidos,
  };

  const institucionBase = {
    id_institucion: rows[0].id_institucion,
    nombre: rows[0].institucion,
  };

  const aulaBase = {
    id_aula: rows[0].id_aula,
    grado: rows[0].grado,
    programa: rows[0].programa,
  };

  const calificaciones = rows.map((r) => ({
    id_calificacion: r.id_calificacion,
    fecha: r.fecha,
    calificacion: r.calificacion,
  }));

  const suma = calificaciones.reduce((acc, c) => acc + Number(c.calificacion), 0);
  const promedio = calificaciones.length > 0 ? suma / calificaciones.length : null;

  return {
    estudiante: estudianteBase,
    institucion: institucionBase,
    aula: aulaBase,
    calificaciones,
    promedio,
  };
}
