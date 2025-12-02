import pool from "../config/db.js";
import { validarIdUnico } from "../utils/validators.js";

console.log(">>> estudiante.services.js cargado");

function validarEstudiante(data, { esCreacion = false } = {}) {
  const errores = [];

  if (esCreacion && !data.id_estudiante) {
    errores.push("id_estudiante es obligatorio");
  }

  if (!data.nombres) errores.push("nombres es obligatorio");
  if (!data.apellidos) errores.push("apellidos es obligatorio");

  if (data.id_aula !== undefined && data.id_aula !== null) {
    if (isNaN(Number(data.id_aula))) {
      errores.push("id_aula debe ser numérico o null");
    }
  }

  return errores;
}

// LISTAR
export async function obtenerEstudiantes() {
  const [rows] = await pool.query("SELECT * FROM estudiante");
  return rows;
}

// OBTENER POR ID
export async function obtenerEstudiantePorId(id) {
  const [rows] = await pool.query(
    "SELECT * FROM estudiante WHERE id_estudiante = ?",
    [id]
  );
  return rows[0];
}

// CREAR
export async function crearEstudiante(data) {
  const errores = validarEstudiante(data, { esCreacion: true });
  if (errores.length > 0) {
    const error = new Error(errores.join(", "));
    error.tipo = "VALIDACION";
    throw error;
  }

  const {
    id_estudiante,
    nombres,
    apellidos,
    id_aula = null,
  } = data;

  // Validar ID único
  if (await validarIdUnico("estudiante", "id_estudiante", id_estudiante)) {
    const error = new Error("El ID ya existe en estudiante");
    error.tipo = "VALIDACION";
    throw error;
  }

  // Validar que el aula exista si se envía
  if (id_aula !== null) {
    const [aulas] = await pool.query(
      "SELECT id_aula FROM aula WHERE id_aula = ?",
      [id_aula]
    );
    if (aulas.length === 0) {
      const error = new Error("El id_aula no existe");
      error.tipo = "VALIDACION";
      throw error;
    }
  }

  await pool.query(
    `INSERT INTO estudiante (id_estudiante, nombres, apellidos, id_aula)
     VALUES (?, ?, ?, ?)`,
    [id_estudiante, nombres.trim(), apellidos.trim(), id_aula]
  );

  return { id_estudiante, nombres, apellidos, id_aula };
}

// ACTUALIZAR
export async function actualizarEstudiante(id, data) {
  const errores = validarEstudiante(data, { esCreacion: false });
  if (errores.length > 0) {
    const error = new Error(errores.join(", "));
    error.tipo = "VALIDACION";
    throw error;
  }

  const { nombres, apellidos, id_aula = null } = data;

  // 1. Obtener info del aula actual del estudiante (si existe)
  const [infoActualRows] = await pool.query(
    `
    SELECT 
      e.id_aula        AS id_aula_actual,
      a.grado          AS grado_actual,
      a.programa       AS programa_actual
    FROM estudiante e
    LEFT JOIN aula a ON a.id_aula = e.id_aula
    WHERE e.id_estudiante = ?
    `,
    [id]
  );

  const infoActual = infoActualRows[0] || null;

  // 2. Validar que el aula nueva exista si se envía
  let infoNuevaAula = null;

  if (id_aula !== null) {
    const [aulas] = await pool.query(
      "SELECT id_aula, grado, programa FROM aula WHERE id_aula = ?",
      [id_aula]
    );
    if (aulas.length === 0) {
      const error = new Error("El id_aula no existe");
      error.tipo = "VALIDACION";
      throw error;
    }
    infoNuevaAula = aulas[0];
  }

  // 3. Regla de negocio: no mezclar INSIDECLASSROOM con OUTSIDECLASSROOM
  // Solo aplica si:
  // - el estudiante ya tiene un aula actual
  // - se está asignando un aula nueva no nula
  // - el id de aula realmente cambia
  if (
    infoActual &&
    infoActual.id_aula_actual !== null &&
    id_aula !== null &&
    Number(infoActual.id_aula_actual) !== Number(id_aula)
  ) {
    const programaActual = infoActual.programa_actual;
    const programaNueva = infoNuevaAula ? infoNuevaAula.programa : null;

    if (
      programaActual &&
      programaNueva &&
      programaActual !== programaNueva
    ) {
      const error = new Error(
        `No se permite mover al estudiante de un aula del programa ${programaActual} ` +
        `a un aula del programa ${programaNueva}. Solo se puede mover dentro de ` +
        `INSIDECLASSROOM (grados 4° y 5°) o dentro de OUTSIDECLASSROOM (grados 9° y 10°).`
      );
      error.tipo = "VALIDACION";
      throw error;
    }
  }

  // 4. Actualizar estudiante
  await pool.query(
    `UPDATE estudiante 
     SET nombres = ?, apellidos = ?, id_aula = ?
     WHERE id_estudiante = ?`,
    [nombres.trim(), apellidos.trim(), id_aula, id]
  );

  return { id_estudiante: id, nombres, apellidos, id_aula };
}


// ELIMINAR
export async function eliminarEstudiante(id) {
  await pool.query(
    "DELETE FROM estudiante WHERE id_estudiante = ?",
    [id]
  );
  return { mensaje: "Estudiante eliminado correctamente" };
}
