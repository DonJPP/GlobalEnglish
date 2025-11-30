import pool from "../config/db.js";

console.log(">>> fechaReposicion.services.js cargado");

// ---------- Helpers de validación ----------
function validarReposicion(data, { esCreacion = false } = {}) {
  const errores = [];

  if (!data.id_asistencia && data.id_asistencia !== 0) {
    errores.push("id_asistencia es obligatorio");
  } else if (isNaN(Number(data.id_asistencia))) {
    errores.push("id_asistencia debe ser numérico");
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

// ---------- Helpers BD ----------

// Traer la asistencia_tutor asociada
async function obtenerAsistenciaTutor(id_asistencia) {
  const [rows] = await pool.query(
    `SELECT id_asistencia, fecha, asistio, id_aula, id_tutor
       FROM asistencia_tutor
      WHERE id_asistencia = ?`,
    [id_asistencia]
  );
  return rows[0]; // puede ser undefined
}

// Verificar si ya existe reposición para esa inasistencia
async function existeReposicionParaAsistencia(id_asistencia) {
  const [rows] = await pool.query(
    "SELECT id_reposicion FROM fecha_reposicion WHERE id_asistencia = ?",
    [id_asistencia]
  );
  return rows.length > 0 ? rows[0] : null;
}

// Verificar que el tutor exista
async function existeTutor(id_tutor) {
  const [rows] = await pool.query(
    "SELECT id_tutor FROM tutor WHERE id_tutor = ?",
    [id_tutor]
  );
  return rows.length > 0;
}

// ================== CRUD ==================

// LISTAR TODAS
export async function obtenerReposiciones() {
  const [rows] = await pool.query("SELECT * FROM fecha_reposicion");
  return rows;
}

// OBTENER POR ID
export async function obtenerReposicionPorId(id_reposicion) {
  const [rows] = await pool.query(
    "SELECT * FROM fecha_reposicion WHERE id_reposicion = ?",
    [id_reposicion]
  );
  return rows[0];
}

// OBTENER POR id_asistencia
export async function obtenerReposicionesPorAsistencia(id_asistencia) {
  const [rows] = await pool.query(
    "SELECT * FROM fecha_reposicion WHERE id_asistencia = ?",
    [id_asistencia]
  );
  return rows;
}

// CREAR REPOSICIÓN
export async function crearReposicion(data) {
  const errores = validarReposicion(data, { esCreacion: true });
  if (errores.length > 0) {
    const error = new Error(errores.join(", "));
    error.tipo = "VALIDACION";
    throw error;
  }

  const id_asistencia = Number(data.id_asistencia);
  const id_tutor = Number(data.id_tutor);
  const fecha_reposicion = data.fecha;

  // 1. Verificar que el tutor exista
  if (!(await existeTutor(id_tutor))) {
    const error = new Error("El tutor indicado no existe");
    error.tipo = "VALIDACION";
    throw error;
  }

  // 2. Verificar que la asistencia exista
  const asistencia = await obtenerAsistenciaTutor(id_asistencia);
  if (!asistencia) {
    const error = new Error("La asistencia indicada no existe");
    error.tipo = "VALIDACION";
    throw error;
  }

  // 3. Verificar que esa asistencia sea una inasistencia (asistio = 'NO')
  if (String(asistencia.asistio).toUpperCase() !== "NO") {
    const error = new Error(
      "Solo se puede registrar reposición para asistencias donde asistio = 'NO'"
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  // 4. Verificar que el tutor coincida con el de la inasistencia
  if (Number(asistencia.id_tutor) !== id_tutor) {
    const error = new Error(
      `El tutor indicado (id_tutor=${id_tutor}) no coincide con el tutor de la asistencia (id_tutor=${asistencia.id_tutor}).`
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  // 5. Verificar que no exista ya una reposición
  const yaExiste = await existeReposicionParaAsistencia(id_asistencia);
  if (yaExiste) {
    const error = new Error(
      `Ya existe una reposición registrada para esta inasistencia (id_reposicion=${yaExiste.id_reposicion}).`
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  // 6. Validar que la fecha de reposición no sea antes que la fecha original
  if (fecha_reposicion < asistencia.fecha) {
    const error = new Error(
      `La fecha de reposición (${fecha_reposicion}) no puede ser anterior a la fecha original de la clase (${asistencia.fecha}).`
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  // 7. Insertar
  const [result] = await pool.query(
    `INSERT INTO fecha_reposicion (fecha, id_asistencia, id_tutor)
     VALUES (?, ?, ?)`,
    [fecha_reposicion, id_asistencia, id_tutor]
  );

  return {
    id_reposicion: result.insertId,
    id_asistencia,
    id_tutor,
    fecha: fecha_reposicion,
  };
}

// ACTUALIZAR REPOSICIÓN
export async function actualizarReposicion(id_reposicion, data) {
  const errores = validarReposicion(data, { esCreacion: false });
  if (errores.length > 0) {
    const error = new Error(errores.join(", "));
    error.tipo = "VALIDACION";
    throw error;
  }

  const id_asistencia = Number(data.id_asistencia);
  const id_tutor = Number(data.id_tutor);
  const fecha_reposicion = data.fecha;

  if (!(await existeTutor(id_tutor))) {
    const error = new Error("El tutor indicado no existe");
    error.tipo = "VALIDACION";
    throw error;
  }

  const asistencia = await obtenerAsistenciaTutor(id_asistencia);
  if (!asistencia) {
    const error = new Error("La asistencia indicada no existe");
    error.tipo = "VALIDACION";
    throw error;
  }

  if (String(asistencia.asistio).toUpperCase() !== "NO") {
    const error = new Error(
      "Solo se puede asociar una reposición a asistencias donde asistio = 'NO'"
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  if (Number(asistencia.id_tutor) !== id_tutor) {
    const error = new Error(
      `El tutor indicado (id_tutor=${id_tutor}) no coincide con el tutor de la asistencia (id_tutor=${asistencia.id_tutor}).`
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  if (fecha_reposicion < asistencia.fecha) {
    const error = new Error(
      `La fecha de reposición no puede ser anterior a la fecha original de la clase (${asistencia.fecha}).`
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  await pool.query(
    `UPDATE fecha_reposicion
       SET fecha = ?, id_asistencia = ?, id_tutor = ?
     WHERE id_reposicion = ?`,
    [fecha_reposicion, id_asistencia, id_tutor, id_reposicion]
  );

  return {
    id_reposicion: Number(id_reposicion),
    id_asistencia,
    id_tutor,
    fecha: fecha_reposicion,
  };
}

// ELIMINAR
export async function eliminarReposicion(id_reposicion) {
  await pool.query(
    "DELETE FROM fecha_reposicion WHERE id_reposicion = ?",
    [id_reposicion]
  );
  return { mensaje: "Fecha de reposición eliminada correctamente" };
}
