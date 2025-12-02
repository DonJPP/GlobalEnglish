import * as CalificacionesService from "../services/calificaciones.services.js";

// GET - todas las calificaciones
export async function obtenerCalificaciones(req, res) {
  try {
    const data = await CalificacionesService.obtenerCalificaciones();
    res.json(data);
  } catch (error) {
    console.error(">>> ERROR obtenerCalificaciones:", error);
    res.status(500).json({ error: error.message });
  }
}

// GET - una calificación por ID
export async function obtenerCalificacionPorId(req, res) {
  try {
    const calif = await CalificacionesService.obtenerCalificacionPorId(
      req.params.id
    );
    if (!calif) {
      return res
        .status(404)
        .json({ error: "Calificación no encontrada" });
    }
    res.json(calif);
  } catch (error) {
    console.error(">>> ERROR obtenerCalificacionPorId:", error);
    res.status(500).json({ error: error.message });
  }
}

// GET - historial por estudiante
export async function obtenerCalificacionesPorEstudiante(req, res) {
  try {
    const { desde, hasta } = req.query;
    const data = await CalificacionesService.obtenerCalificacionesPorEstudiante(
      req.params.id_estudiante,
      { desde, hasta }
    );
    res.json(data);
  } catch (error) {
    console.error(">>> ERROR obtenerCalificacionesPorEstudiante:", error);
    res.status(500).json({ error: error.message });
  }
}

// POST - crear
export async function crearCalificacion(req, res) {
  try {
    const nueva = await CalificacionesService.crearCalificacion(req.body);
    res.status(201).json(nueva);
  } catch (error) {
    console.error(">>> ERROR crearCalificacion:", error);
    if (error.tipo === "VALIDACION") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// PUT - actualizar
export async function actualizarCalificacion(req, res) {
  try {
    const actualizada =
      await CalificacionesService.actualizarCalificacion(
        req.params.id,
        req.body
      );
    res.json(actualizada);
  } catch (error) {
    console.error(">>> ERROR actualizarCalificacion:", error);
    if (error.tipo === "VALIDACION") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// DELETE - eliminar
export async function eliminarCalificacion(req, res) {
  try {
    const eliminado =
      await CalificacionesService.eliminarCalificacion(req.params.id);
    res.json(eliminado);
  } catch (error) {
    console.error(">>> ERROR eliminarCalificacion:", error);
    res.status(500).json({ error: error.message });
  }
}
