import pool from "../config/db.js";

console.log(">>> reportes.services.js cargado");

/** ===================== HORARIO DE UN AULA ===================== **/

export async function reporteHorarioAula(id_aula) {
  if (!id_aula || isNaN(Number(id_aula))) {
    const err = new Error("id_aula es obligatorio y debe ser numérico");
    err.tipo = "VALIDACION";
    throw err;
  }

  const [rows] = await pool.query(
    `
    SELECT
      h.id_horario,
      h.id_aula,
      h.dia_semana,
      h.hora_inicio,
      h.hora_fin,
      h.minutos_equivalentes,

      a.grado,
      a.programa,

      s.id_sede,
      s.direccion_completa,

      i.id_institucion,
      i.nombre AS institucion

    FROM horario h
    JOIN aula a          ON a.id_aula = h.id_aula
    JOIN sede s          ON s.id_sede = a.id_sede
    JOIN institucion i   ON i.id_institucion = s.id_institucion
    WHERE h.id_aula = ?
    ORDER BY 
        FIELD(h.dia_semana, 'LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO'),
        h.hora_inicio
    `,
    [Number(id_aula)]
  );

  return rows;
}

/** ===================== HORARIO TUTOR ===================== **/

export async function reporteHorarioTutor(id_tutor) {
  if (!id_tutor || isNaN(Number(id_tutor))) {
    const err = new Error("id_tutor es obligatorio y debe ser numérico");
    err.tipo = "VALIDACION";
    throw err;
  }

  const [rows] = await pool.query(
    `
    SELECT
      t.id_tutor,
      t.nombres AS tutor_nombres,
      t.apellidos AS tutor_apellidos,

      a.id_aula,
      a.grado,
      a.programa,

      s.id_sede,
      s.direccion_completa,

      i.id_institucion,
      i.nombre AS institucion,

      h.dia_semana,
      h.hora_inicio,
      h.hora_fin,
      h.minutos_equivalentes

    FROM relacion_aula_tutor rat
    JOIN tutor t          ON t.id_tutor       = rat.id_tutor
    JOIN aula a           ON a.id_aula        = rat.id_aula
    JOIN sede s           ON s.id_sede        = a.id_sede
    JOIN institucion i    ON i.id_institucion = s.id_institucion
    JOIN horario h        ON h.id_aula        = a.id_aula

    WHERE rat.id_tutor = ?
    ORDER BY h.dia_semana, h.hora_inicio
    `,
    [id_tutor]
  );

  return rows;
}

/** ===================== ASISTENCIA AULA ===================== **/

export async function reporteAsistenciaAula({ id_institucion, id_aula, desde, hasta }) {
  if (!desde || !hasta) {
    const err = new Error(
      "Los parámetros 'desde' y 'hasta' son obligatorios (YYYY-MM-DD)."
    );
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
      fr.fecha        AS fecha_reposicion,

      -- agregados por día/aula desde asistencia_estudiante
      est_agg.total_estudiantes_presentes,
      est_agg.estudiantes_presentes

    FROM asistencia_tutor at
    JOIN aula a            ON a.id_aula        = at.id_aula
    JOIN sede s            ON s.id_sede        = a.id_sede
    JOIN institucion i     ON i.id_institucion = s.id_institucion
    LEFT JOIN tutor t      ON t.id_tutor       = at.id_tutor
    LEFT JOIN horario h    ON h.id_aula        = a.id_aula
    LEFT JOIN motivo_inasistencia mi ON mi.id_motivo = at.id_motivo
    LEFT JOIN fecha_reposicion fr    ON fr.id_asistencia = at.id_asistencia

    -- subconsulta agregada: estudiantes presentes por aula+fecha
    LEFT JOIN (
      SELECT
        ae.id_aula,
        DATE(ae.fecha) AS fecha,
        COUNT(DISTINCT ae.id_estudiante) AS total_estudiantes_presentes,
        GROUP_CONCAT(
          DISTINCT CONCAT(e.nombres, ' ', e.apellidos, ' (', ae.id_estudiante, ')')
          ORDER BY e.apellidos, e.nombres
          SEPARATOR ', '
        ) AS estudiantes_presentes
      FROM asistencia_estudiante ae
      JOIN estudiante e
        ON e.id_estudiante = ae.id_estudiante
      GROUP BY ae.id_aula, DATE(ae.fecha)
    ) AS est_agg
      ON est_agg.id_aula = at.id_aula
     AND est_agg.fecha   = at.fecha

    WHERE ${where}
    ORDER BY i.nombre, a.id_aula, at.fecha, h.hora_inicio
    `,
    params
  );

  const resultado = rows.map((r) => ({
    ...r,
    horas_dictadas: r.asistio === "SI" ? 1 : 0,
    horas_no_dictadas: r.asistio === "NO" ? 1 : 0,
  }));

  return resultado;
}


/** ===================== ASISTENCIA ESTUDIANTE ===================== **/

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

/** ===================== NOTAS ESTUDIANTE ===================== **/

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
    JOIN estudiante e      ON e.id_estudiante = c.id_estudiante
    LEFT JOIN aula a       ON a.id_aula       = e.id_aula
    LEFT JOIN sede s       ON s.id_sede       = a.id_sede
    LEFT JOIN institucion i ON i.id_institucion = s.id_institucion
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

  const suma = calificaciones.reduce(
    (acc, c) => acc + Number(c.calificacion),
    0
  );
  const promedio =
    calificaciones.length > 0 ? suma / calificaciones.length : null;

  return {
    estudiante: estudianteBase,
    institucion: institucionBase,
    aula: aulaBase,
    calificaciones,
    promedio,
  };
}

// ======= ASISTENCIA DEL TUTOR (HISTORIAL) =======
export async function reporteAsistenciaTutor({ id_tutor }) {
  if (!id_tutor || isNaN(Number(id_tutor))) {
    const err = new Error("id_tutor es obligatorio y debe ser numérico");
    err.tipo = "VALIDACION";
    throw err;
  }

  const [rows] = await pool.query(
    `
    SELECT
      at.id_asistencia,
      at.fecha,
      at.asistio,
      at.id_motivo,

      t.id_tutor,
      t.nombres      AS tutor_nombres,
      t.apellidos    AS tutor_apellidos,

      a.id_aula,
      a.grado,
      a.programa,

      s.id_sede,
      s.direccion_completa,

      i.id_institucion,
      i.nombre       AS institucion,

      mi.razon       AS motivo_inasistencia
    FROM asistencia_tutor at
    JOIN tutor t          ON t.id_tutor       = at.id_tutor
    JOIN aula a           ON a.id_aula        = at.id_aula
    JOIN sede s           ON s.id_sede        = a.id_sede
    JOIN institucion i    ON i.id_institucion = s.id_institucion
    LEFT JOIN motivo_inasistencia mi ON mi.id_motivo = at.id_motivo
    WHERE at.id_tutor = ?
    ORDER BY at.fecha DESC, at.id_asistencia DESC
    `,
    [Number(id_tutor)]
  );

  return rows; // si no hay filas, el controller devolverá 404
}

// ======= NOTAS TOMADAS POR UN TUTOR =======
export async function reporteNotasTutor({ id_tutor, desde, hasta }) {
  if (!id_tutor || isNaN(Number(id_tutor))) {
    const err = new Error("id_tutor es obligatorio y debe ser numérico");
    err.tipo = "VALIDACION";
    throw err;
  }

  const params = [Number(id_tutor)];
  let where = "t.id_tutor = ?";

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
      t.id_tutor,
      t.nombres        AS tutor_nombres,
      t.apellidos      AS tutor_apellidos,

      c.id_calificacion,
      c.fecha,
      c.calificacion,

      e.id_estudiante,
      e.nombres        AS estudiante_nombres,
      e.apellidos      AS estudiante_apellidos,

      a.id_aula,
      a.grado,
      a.programa
    FROM tutor t
    JOIN relacion_aula_tutor rat
         ON rat.id_tutor = t.id_tutor
    JOIN aula a
         ON a.id_aula = rat.id_aula
    JOIN estudiante e
         ON e.id_aula = a.id_aula
    JOIN calificaciones c
         ON c.id_estudiante = e.id_estudiante
    WHERE ${where}
    ORDER BY c.fecha, c.id_calificacion
    `,
    params
  );

  // Si quieres devolver solo lo mínimo puedes mapear aquí,
  // pero dejo toda la info por si el frontend quiere mostrar más.
  // Por ejemplo, para quedarte solo con fecha, id_estudiante y nota:
  // return rows.map(r => ({
  //   fecha: r.fecha,
  //   id_estudiante: r.id_estudiante,
  //   calificacion: r.calificacion,
  // }));

  return rows;
}
