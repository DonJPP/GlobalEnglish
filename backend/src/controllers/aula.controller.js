import * as AulaService from "../services/aula.services.js";

// GET - todas las aulas
export async function obtenerAulas(req, res) {
  try {
    const aulas = await AulaService.obtenerAulas();
    res.json(aulas);
  } catch (error) {
    console.error(">>> ERROR obtenerAulas:", error);
    res.status(500).json({ error: error.message });
  }
}

// GET - aula por ID
export async function obtenerAulaPorId(req, res) {
  try {
    const aula = await AulaService.obtenerAulaPorId(req.params.id);
    if (!aula) {
      return res.status(404).json({ error: "Aula no encontrada" });
    }
    res.json(aula);
  } catch (error) {
    console.error(">>> ERROR obtenerAulaPorId:", error);
    res.status(500).json({ error: error.message });
  }
}

// POST - crear aula
export async function crearAula(req, res) {
  try {
    const nueva = await AulaService.crearAula(req.body);
    res.status(201).json(nueva);
  } catch (error) {
    console.error(">>> ERROR crearAula:", error);
    if (error.tipo === "VALIDACION") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// PUT - actualizar aula
export async function actualizarAula(req, res) {
  try {
    const actualizada = await AulaService.actualizarAula(
      req.params.id,
      req.body
    );
    res.json(actualizada);
  } catch (error) {
    console.error(">>> ERROR actualizarAula:", error);
    if (error.tipo === "VALIDACION") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// DELETE - eliminar aula
export async function eliminarAula(req, res) {
  try {
    const eliminado = await AulaService.eliminarAula(req.params.id);
    res.json(eliminado);
  } catch (error) {
    console.error(">>> ERROR eliminarAula:", error);
    res.status(500).json({ error: error.message });
  }
}
