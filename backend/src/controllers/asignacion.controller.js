import * as AsignacionService from "../services/asignacion.services.js";

// GET - todas las asignaciones
export async function obtenerAsignaciones(req, res) {
  try {
    const data = await AsignacionService.obtenerAsignaciones();
    res.json(data);
  } catch (error) {
    console.error(">>> ERROR obtenerAsignaciones:", error);
    res.status(500).json({ error: error.message });
  }
}

// GET - por id_asignacion
export async function obtenerAsignacionPorId(req, res) {
  try {
    const asignacion = await AsignacionService.obtenerAsignacionPorId(
      req.params.id
    );
    if (!asignacion) {
      return res.status(404).json({ error: "Asignación no encontrada" });
    }
    res.json(asignacion);
  } catch (error) {
    console.error(">>> ERROR obtenerAsignacionPorId:", error);
    res.status(500).json({ error: error.message });
  }
}

// GET - por id_aula
export async function obtenerAsignacionesPorAula(req, res) {
  try {
    const data = await AsignacionService.obtenerAsignacionPorAula(
      req.params.id_aula
    );
    res.json(data);
  } catch (error) {
    console.error(">>> ERROR obtenerAsignacionesPorAula:", error);
    res.status(500).json({ error: error.message });
  }
}

// GET - por id_tutor
export async function obtenerAsignacionesPorTutor(req, res) {
  try {
    const data = await AsignacionService.obtenerAsignacionesPorTutor(
      req.params.id_tutor
    );
    res.json(data);
  } catch (error) {
    console.error(">>> ERROR obtenerAsignacionesPorTutor:", error);
    res.status(500).json({ error: error.message });
  }
}

// POST - crear nueva asignación
export async function crearAsignacion(req, res) {
  try {
    const nueva = await AsignacionService.crearAsignacion(req.body);
    res.status(201).json(nueva);
  } catch (error) {
    console.error(">>> ERROR crearAsignacion:", error);
    if (error.tipo === "VALIDACION") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// PUT - actualizar asignación
export async function actualizarAsignacion(req, res) {
  try {
    const actualizada = await AsignacionService.actualizarAsignacion(
      req.params.id,
      req.body
    );
    res.json(actualizada);
  } catch (error) {
    console.error(">>> ERROR actualizarAsignacion:", error);
    if (error.tipo === "VALIDACION") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// DELETE - eliminar asignación
export async function eliminarAsignacion(req, res) {
  try {
    const eliminado = await AsignacionService.eliminarAsignacion(
      req.params.id
    );
    res.json(eliminado);
  } catch (error) {
    console.error(">>> ERROR eliminarAsignacion:", error);
    res.status(500).json({ error: error.message });
  }
}
