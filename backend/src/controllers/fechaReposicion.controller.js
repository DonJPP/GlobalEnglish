import * as FechaRepService from "../services/fechaReposicion.services.js";

// GET - todas las reposiciones
export async function obtenerReposiciones(req, res) {
  try {
    const data = await FechaRepService.obtenerReposiciones();
    res.json(data);
  } catch (error) {
    console.error(">>> ERROR obtenerReposiciones:", error);
    res.status(500).json({ error: error.message });
  }
}

// GET - por id_reposicion
export async function obtenerReposicionPorId(req, res) {
  try {
    const repo = await FechaRepService.obtenerReposicionPorId(req.params.id);
    if (!repo) {
      return res
        .status(404)
        .json({ error: "Fecha de reposición no encontrada" });
    }
    res.json(repo);
  } catch (error) {
    console.error(">>> ERROR obtenerReposicionPorId:", error);
    res.status(500).json({ error: error.message });
  }
}

// GET - por id_asistencia
export async function obtenerReposicionesPorAsistencia(req, res) {
  try {
    const data = await FechaRepService.obtenerReposicionesPorAsistencia(
      req.params.id_asistencia
    );
    res.json(data);
  } catch (error) {
    console.error(">>> ERROR obtenerReposicionesPorAsistencia:", error);
    res.status(500).json({ error: error.message });
  }
}

// POST - crear reposición
export async function crearReposicion(req, res) {
  try {
    const nueva = await FechaRepService.crearReposicion(req.body);
    res.status(201).json(nueva);
  } catch (error) {
    console.error(">>> ERROR crearReposicion:", error);
    if (error.tipo === "VALIDACION") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// PUT - actualizar reposición
export async function actualizarReposicion(req, res) {
  try {
    const actualizada = await FechaRepService.actualizarReposicion(
      req.params.id,
      req.body
    );
    res.json(actualizada);
  } catch (error) {
    console.error(">>> ERROR actualizarReposicion:", error);
    if (error.tipo === "VALIDACION") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// DELETE - eliminar
export async function eliminarReposicion(req, res) {
  try {
    const eliminado = await FechaRepService.eliminarReposicion(req.params.id);
    res.json(eliminado);
  } catch (error) {
    console.error(">>> ERROR eliminarReposicion:", error);
    res.status(500).json({ error: error.message });
  }
}
