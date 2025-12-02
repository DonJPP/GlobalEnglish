import pool from "../config/db.js";

console.log(">>> sede.services.js cargado");

//<<<<<<<<<<<<<<<<<<<<<<VALIDACIÓN>>>>>>>>>>>>>>>>>>>>>>
function validarSede(data, { esCreacion = false } = {}) {
  const errores = [];

  if (esCreacion && !data.id_sede) {
    errores.push("id_sede es obligatorio");
  }

  if (esCreacion && isNaN(Number(data.id_sede))) {
    errores.push("id_sede debe ser numérico");
  }

  if (!data.direccion_completa)
    errores.push("La dirección completa es obligatoria");

  if (!data.sede_principal)
    errores.push("El campo sede_principal es obligatorio (SI/NO)");

  const sedeUpper = String(data.sede_principal).toUpperCase();
  if (!["SI", "NO"].includes(sedeUpper)) {
    errores.push("sede_principal debe ser 'SI' o 'NO'");
  }

  if (!data.id_institucion)
    errores.push("id_institucion es obligatorio");

  if (isNaN(Number(data.id_institucion))) {
    errores.push("id_institucion debe ser numérico");
  }

  return errores;
}

//  VALIDAR ID ÚNICO 
async function validarIdSedeUnico(id_sede) {
  const [rows] = await pool.query(
    "SELECT id_sede FROM sede WHERE id_sede = ?",
    [id_sede]
  );
  return rows.length > 0; // true si existe
}

// --- LISTAR TODO ---
export async function obtenerSedes() {
  const [rows] = await pool.query("SELECT * FROM sede");
  return rows;
}

// --- OBTENER POR ID ---
export async function obtenerSedePorId(id_sede) {
  const [rows] = await pool.query(
    "SELECT * FROM sede WHERE id_sede = ?",
    [id_sede]
  );
  return rows[0];
}

// --- CREAR ---
export async function crearSede(data) {
  const errores = validarSede(data, { esCreacion: true });
  if (errores.length > 0) {
    const error = new Error(errores.join(", "));
    error.tipo = "VALIDACION";
    throw error;
  }

  const id_sede = Number(data.id_sede);
  const direccion = data.direccion_completa.trim();
  const sede_principal = data.sede_principal.trim().toUpperCase();
  const id_institucion = Number(data.id_institucion);

  // Validar ID único
  if (await validarIdSedeUnico(id_sede)) {
    const error = new Error("El id_sede ya existe");
    error.tipo = "VALIDACION";
    throw error;
  }

  // Validar que la institución exista
  const [inst] = await pool.query(
    "SELECT id_institucion FROM institucion WHERE id_institucion = ?",
    [id_institucion]
  );

  if (inst.length === 0) {
    const error = new Error("La institución indicada no existe");
    error.tipo = "VALIDACION";
    throw error;
  }

  // Insertar en sede
  await pool.query(
    `INSERT INTO sede (id_sede, direccion_completa, sede_principal, id_institucion)
     VALUES (?, ?, ?, ?)`,
    [id_sede, direccion, sede_principal, id_institucion]
  );

  return {
    id_sede,
    direccion_completa: direccion,
    sede_principal,
    id_institucion
  };
}

// --- ACTUALIZAR ---
export async function actualizarSede(id_sede, data) {
  const errores = validarSede(data);
  if (errores.length > 0) {
    const error = new Error(errores.join(", "));
    error.tipo = "VALIDACION";
    throw error;
  }

  const direccion = data.direccion_completa.trim();
  const sede_principal = data.sede_principal.trim().toUpperCase();
  const id_institucion = Number(data.id_institucion);

  // Validar que la institución exista
  const [inst] = await pool.query(
    "SELECT id_institucion FROM institucion WHERE id_institucion = ?",
    [id_institucion]
  );

  if (inst.length === 0) {
    const error = new Error("La institución indicada no existe");
    error.tipo = "VALIDACION";
    throw error;
  }

  // Actualizar
  await pool.query(
    `UPDATE sede 
     SET direccion_completa=?, sede_principal=?, id_institucion=? 
     WHERE id_sede=?`,
    [direccion, sede_principal, id_institucion, id_sede]
  );

  return {
    id_sede,
    direccion_completa: direccion,
    sede_principal,
    id_institucion
  };
}

// --- ELIMINAR ---
export async function eliminarSede(id_sede) {
  await pool.query("DELETE FROM sede WHERE id_sede = ?", [id_sede]);
  return { mensaje: "Sede eliminada correctamente" };
}
