import pool from "../config/db.js";

console.log(">>> cambioTutor.services.js cargado");

// ------------ Helpers de validación ------------
function validarCambioTutor(data) {
  const errores = [];

  if (!data.id_aula && data.id_aula !== 0) {
    errores.push("id_aula es obligatorio");
  } else if (isNaN(Number(data.id_aula))) {
    errores.push("id_aula debe ser numérico");
  }

  if (!data.id_tutor_v && data.id_tutor_v !== 0) {
    errores.push("id_tutor_v (tutor viejo) es obligatorio");
  } else if (isNaN(Number(data.id_tutor_v))) {
    errores.push("id_tutor_v debe ser numérico");
  }

  if (!data.id_tutor_n && data.id_tutor_n !== 0) {
    errores.push("id_tutor_n (tutor nuevo) es obligatorio");
  } else if (isNaN(Number(data.id_tutor_n))) {
    errores.push("id_tutor_n debe ser numérico");
  }

  if (data.id_tutor_v && data.id_tutor_n && Number(data.id_tutor_v) === Number(data.id_tutor_n)) {
    errores.push("id_tutor_v y id_tutor_n no pueden ser el mismo (no tiene sentido cambiar al mismo tutor)");
  }

  if (!data.fecha) {
    errores.push("fecha es obligatoria (YYYY-MM-DD)");
  } else {
    const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
    if (!regexFecha.test(data.fecha)) {
      errores.push("fecha debe tener formato YYYY-MM-DD");
    }
  }

  if (data.nota && data.nota.length > 100) {
    errores.push("nota no puede superar 100 caracteres");
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

// Obtener asignación actual de un aula
async function obtenerAsignacionActual(id_aula) {
  const [rows] = await pool.query(
    "SELECT * FROM relacion_aula_tutor WHERE id_aula = ?",
    [id_aula]
  );
  return rows[0]; // undefined si no hay asignación
}

// ================== FUNCIONES PÚBLICAS ==================

// Listar todos los cambios
export async function obtenerCambiosTutor() {
  const [rows] = await pool.query("SELECT * FROM cambio_tutor");
  return rows;
}

// Obtener cambio por ID
export async function obtenerCambioTutorPorId(id_cambio) {
  const [rows] = await pool.query(
    "SELECT * FROM cambio_tutor WHERE id_cambio = ?",
    [id_cambio]
  );
  return rows[0];
}

// Obtener cambios por aula
export async function obtenerCambiosPorAula(id_aula) {
  const [rows] = await pool.query(
    "SELECT * FROM cambio_tutor WHERE id_aula = ? ORDER BY fecha DESC, id_cambio DESC",
    [id_aula]
  );
  return rows;
}

// Crear un cambio de tutor
export async function crearCambioTutor(data) {
  const errores = validarCambioTutor(data);
  if (errores.length > 0) {
    const error = new Error(errores.join(", "));
    error.tipo = "VALIDACION";
    throw error;
  }

  const id_aula = Number(data.id_aula);
  const id_tutor_v = Number(data.id_tutor_v);
  const id_tutor_n = Number(data.id_tutor_n);
  const fecha = data.fecha;
  const nota = data.nota ? data.nota.trim() : null;

  // 1. Validar que el aula exista
  if (!(await existeAula(id_aula))) {
    const error = new Error("El aula indicada no existe");
    error.tipo = "VALIDACION";
    throw error;
  }

  // 2. Obtener la asignación actual
  const asignacionActual = await obtenerAsignacionActual(id_aula);
  if (!asignacionActual) {
    const error = new Error(
      "El aula no tiene un tutor asignado actualmente (relacion_aula_tutor)."
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  // 3. Validar que el tutor viejo corresponda al actual
  if (Number(asignacionActual.id_tutor) !== id_tutor_v) {
    const error = new Error(
      `El tutor viejo (id_tutor_v=${id_tutor_v}) no coincide con el tutor actualmente asignado al aula (id_tutor=${asignacionActual.id_tutor}).`
    );
    error.tipo = "VALIDACION";
    throw error;
  }

  // 4. Validar que el nuevo tutor exista
  if (!(await existeTutor(id_tutor_n))) {
    const error = new Error("El tutor nuevo indicado no existe");
    error.tipo = "VALIDACION";
    throw error;
  }

  // 5. Insertar en tabla cambio_tutor
  const [resultCambio] = await pool.query(
    `INSERT INTO cambio_tutor (id_aula, id_tutor_v, id_tutor_n, fecha, nota)
     VALUES (?, ?, ?, ?, ?)`,
    [id_aula, id_tutor_v, id_tutor_n, fecha, nota]
  );

  // 6. Actualizar la relación actual en relacion_aula_tutor
  await pool.query(
    `UPDATE relacion_aula_tutor
     SET id_tutor = ?, fecha_asig = ?
     WHERE id_asignacion = ?`,
    [id_tutor_n, fecha, asignacionActual.id_asignacion]
  );

  return {
    id_cambio: resultCambio.insertId,
    id_aula,
    id_tutor_v,
    id_tutor_n,
    fecha,
    nota,
  };
}

// (Opcional) Eliminar un cambio (normalmente no se hace pero lo dejo)
export async function eliminarCambioTutor(id_cambio) {
  await pool.query("DELETE FROM cambio_tutor WHERE id_cambio = ?", [id_cambio]);
  return { mensaje: "Cambio de tutor eliminado correctamente" };
}
