import * as InstitucionService from "../services/institucion.services.js";

// GET - todas
export async function obtenerInstituciones(req, res) {
  try {
    const data = await InstitucionService.obtenerInstituciones();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET - por ID
export async function obtenerInstitucionPorId(req, res) {
  try {
    const inst = await InstitucionService.obtenerInstitucionPorId(req.params.id);
    if (!inst) return res.status(404).json({ error: "Institución no encontrada" });
    res.json(inst);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// POST - crear
export async function crearInstitucion(req, res) {
  try {
    const nueva = await InstitucionService.crearInstitucion(req.body);
    res.status(201).json(nueva);
  } catch (error) {
    if (error.tipo === "VALIDACION") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// PUT - actualizar
export async function actualizarInstitucion(req, res) {
  try {
    const actualizada = await InstitucionService.actualizarInstitucion(
      req.params.id,
      req.body
    );
    res.json(actualizada);
  } catch (error) {
    if (error.tipo === "VALIDACION") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// DELETE - eliminar
export async function eliminarInstitucion(req, res) {
  try {
    const eliminado = await InstitucionService.eliminarInstitucion(req.params.id);
    res.json(eliminado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
