import * as AdministrativoService from "../services/administrativo.services.js";

// GET - Todos los administrativos
export async function obtenerAdministrativos(req, res) {
  console.log(">>> Entró a obtenerAdministrativos CONTROLLER");
  try {
    const administrativos = await AdministrativoService.obtenerAdministrativos();
    res.json(administrativos);
  } catch (error) {
    console.error(">>> ERROR en controller:", error);
    res.status(500).json({ error: error.message });
  }
}

// GET - Administrativo por ID
export async function obtenerAdministrativoPorId(req, res) {
  try {
    const administrativo =
      await AdministrativoService.obtenerAdministrativoPorId(req.params.id);
    if (!administrativo) {
      return res
        .status(404)
        .json({ error: "Administrativo no encontrado" });
    }
    res.json(administrativo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// POST - Crear administrativo
export async function crearAdministrativo(req, res) {
  try {
    const nuevo = await AdministrativoService.crearAdministrativo(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    if (error.tipo === "VALIDACION") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// PUT - Actualizar administrativo
export async function actualizarAdministrativo(req, res) {
  try {
    const actualizado = await AdministrativoService.actualizarAdministrativo(
      req.params.id,
      req.body
    );
    res.json(actualizado);
  } catch (error) {
    if (error.tipo === "VALIDACION") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// DELETE - Eliminar administrativo
export async function eliminarAdministrativo(req, res) {
  try {
    const eliminado = await AdministrativoService.eliminarAdministrativo(
      req.params.id
    );
    res.json(eliminado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
