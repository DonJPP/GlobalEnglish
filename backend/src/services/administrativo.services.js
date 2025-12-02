import pool from "../config/db.js";
import { validarIdUnico } from "../utils/validators.js";

console.log(">>> administrativo.services.js cargado");

//<<<<<<<<<<<<<<<<<<<<<VAlidaciones>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
function validarAdministrativo(data, { esCreacion = false } = {}) {
  const errores = [];

  if (esCreacion && !data.id_administrativo) {
    errores.push("id_administrativo es obligatorio");
  }

  if (!data.nombres) errores.push("nombres es obligatorio");
  if (!data.apellidos) errores.push("apellidos es obligatorio");
  if (!data.usuario) errores.push("usuario es obligatorio");
  if (!data.password_hash) errores.push("password_hash es obligatorio");

  if (data.administrador) {
    const valor = String(data.administrador).toUpperCase();
    if (valor !== "SI" && valor !== "NO") {
      errores.push("administrador debe ser 'SI' o 'NO'");
    }
  }

  if (data.id_tutor !== undefined && data.id_tutor !== null) {
    if (isNaN(Number(data.id_tutor))) {
      errores.push("id_tutor debe ser numérico o null");
    }
  }

  return errores;
}

// Obtener lista de todos los administrativos (incluye los que sean admin)
export async function obtenerAdministrativos() {
  const [rows] = await pool.query("SELECT * FROM administrativo");
  return rows;
}

// Obtener administrativo por ID
export async function obtenerAdministrativoPorId(id) {
  const [rows] = await pool.query(
    "SELECT * FROM administrativo WHERE id_administrativo = ?",
    [id]
  );
  return rows[0];
}

// Crear administrativo
export async function crearAdministrativo(data) {
  const errores = validarAdministrativo(data, { esCreacion: true });
  if (errores.length > 0) {
    const error = new Error(errores.join(", "));
    error.tipo = "VALIDACION";
    throw error;
  }

  const {
    id_administrativo,
    nombres,
    apellidos,
    usuario,
    password_hash,
    administrador = "NO", // por defecto NO
    id_tutor = null,      // puede ser null
  } = data;

  if (await validarIdUnico("administrativo", "id_administrativo", id_administrativo)) {
  const error = new Error("El ID ya existe en administrativo");
  error.tipo = "VALIDACION";
  throw error;
}

  await pool.query(    
    `INSERT INTO administrativo 
      (id_administrativo, nombres, apellidos, usuario, password_hash, administrador, id_tutor) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id_administrativo,
      nombres,
      apellidos,
      usuario,
      password_hash,
      administrador,
      id_tutor,
    ]
  );

  return {
    id_administrativo,
    nombres,
    apellidos,
    usuario,
    password_hash,
    administrador,
    id_tutor,
  };
}

// Actualizar administrativo
export async function actualizarAdministrativo(id, data) {
  const errores = validarAdministrativo(data, { esCreacion: false });
  if (errores.length > 0) {
    const error = new Error(errores.join(", "));
    error.tipo = "VALIDACION";
    throw error;
  }

  const {
    nombres,
    apellidos,
    usuario,
    password_hash,
    administrador = "NO",
    id_tutor = null,
  } = data;

  await pool.query(
    `UPDATE administrativo
     SET nombres = ?, apellidos = ?, usuario = ?, password_hash = ?, administrador = ?, id_tutor = ?
     WHERE id_administrativo = ?`,
    [nombres, apellidos, usuario, password_hash, administrador, id_tutor, id]
  );

  return {
    id_administrativo: id,
    nombres,
    apellidos,
    usuario,
    password_hash,
    administrador,
    id_tutor,
  };
}

// Eliminar administrativo
export async function eliminarAdministrativo(id) {
  await pool.query(
    "DELETE FROM administrativo WHERE id_administrativo = ?",
    [id]
  );
  return { mensaje: "Administrativo eliminado correctamente" };
}
