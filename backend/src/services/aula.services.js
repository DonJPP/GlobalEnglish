import pool from "../config/db.js";

console.log(">>> aula.services.js cargado");

// ---------- Helper de validación ----------
function validarAula(data, { esCreacion = false } = {}) {
  const errores = [];

  // id_aula obligatorio y numérico sólo en creación
  if (esCreacion) {
    if (data.id_aula === undefined || data.id_aula === null) {
      errores.push("id_aula es obligatorio");
    } else if (isNaN(Number(data.id_aula))) {
      errores.push("id_aula debe ser numérico");
    }
  }

  if (!data.grado && data.grado !== 0) {
    errores.push("grado es obligatorio");
  }

  if (!data.id_sede && data.id_sede !== 0) {
    errores.push("id_sede es obligatorio");
  } else if (isNaN(Number(data.id_sede))) {
    errores.push("id_sede debe ser numérico");
  }

  // Validar grado permitido (4, 5, 9, 10)
  const gradoStr = String(data.grado).trim();
  const gradosPermitidos = ["4", "5", "9", "10"];

  if (!gradosPermitidos.includes(gradoStr)) {
    errores.push("grado debe ser 4, 5, 9 o 10");
  }

  return errores;
}

// ---------- Asignar programa según grado ----------
function obtenerProgramaPorGrado(grado) {
  const g = String(grado).trim();
  if (g === "4" || g === "5") return "INSIDECLASSROOM";
  if (g === "9" || g === "10") return "OUTSIDECLASSROOM";
  return null;
}

// ---------- Validar id_aula único ----------
async function existeAulaConId(id_aula) {
  const [rows] = await pool.query(
    "SELECT id_aula FROM aula WHERE id_aula = ?",
    [id_aula]
  );
  return rows.length > 0;
}

// ---------- Validar sede existente ----------
async function existeSede(id_sede) {
  const [rows] = await pool.query(
    "SELECT id_sede FROM sede WHERE id_sede = ?",
    [id_sede]
  );
  return rows.length > 0;
}

// ============= CRUD =============

// LISTAR
export async function obtenerAulas() {
  const [rows] = await pool.query("SELECT * FROM aula");
  return rows;
}

// OBTENER POR ID
export async function obtenerAulaPorId(id_aula) {
  const [rows] = await pool.query(
    "SELECT * FROM aula WHERE id_aula = ?",
    [id_aula]
  );
  return rows[0];
}

// CREAR
export async function crearAula(data) {
  const errores = validarAula(data, { esCreacion: true });
  if (errores.length > 0) {
    const error = new Error(errores.join(", "));
    error.tipo = "VALIDACION";
    throw error;
  }

  const id_aula = Number(data.id_aula);
  const grado = String(data.grado).trim();
  const id_sede = Number(data.id_sede);

  const programa = obtenerProgramaPorGrado(grado);
  if (!programa) {
    const error = new Error("No se pudo determinar el programa a partir del grado");
    error.tipo = "VALIDACION";
    throw error;
  }

  // Validar id_aula único
  if (await existeAulaConId(id_aula)) {
    const error = new Error("El id_aula ya existe");
    error.tipo = "VALIDACION";
    throw error;
  }

  // Validar sede existente
  if (!(await existeSede(id_sede))) {
    const error = new Error("La sede indicada no existe");
    error.tipo = "VALIDACION";
    throw error;
  }

  await pool.query(
    `INSERT INTO aula (id_aula, grado, programa, id_sede)
     VALUES (?, ?, ?, ?)`,
    [id_aula, grado, programa, id_sede]
  );

  return { id_aula, grado, programa, id_sede };
}

// ACTUALIZAR
export async function actualizarAula(id_aula, data) {
  const errores = validarAula(data, { esCreacion: false });
  if (errores.length > 0) {
    const error = new Error(errores.join(", "));
    error.tipo = "VALIDACION";
    throw error;
  }

  const grado = String(data.grado).trim();
  const id_sede = Number(data.id_sede);

  const programa = obtenerProgramaPorGrado(grado);
  if (!programa) {
    const error = new Error("No se pudo determinar el programa a partir del grado");
    error.tipo = "VALIDACION";
    throw error;
  }

  // Validar sede existente
  if (!(await existeSede(id_sede))) {
    const error = new Error("La sede indicada no existe");
    error.tipo = "VALIDACION";
    throw error;
  }

  await pool.query(
    `UPDATE aula
     SET grado = ?, programa = ?, id_sede = ?
     WHERE id_aula = ?`,
    [grado, programa, id_sede, id_aula]
  );

  return { id_aula: Number(id_aula), grado, programa, id_sede };
}

// ELIMINAR
export async function eliminarAula(id_aula) {
  await pool.query(
    "DELETE FROM aula WHERE id_aula = ?",
    [id_aula]
  );
  return { mensaje: "Aula eliminada correctamente" };
}
