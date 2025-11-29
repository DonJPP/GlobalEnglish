import * as AsistenciaEstService from "../services/asistenciaEstudiante.services.js";

// GET - todas
export async function obtenerAsistenciasEstudiante(req, res) {
  try {
    const data = await AsistenciaEstService.obtenerAsistenciasEstudiante();
    res.json(data);
  } catch (error) {
    console.error(">>> ERROR obtenerAsistenciasEstudiante:", error);
    res.status(500).json({ error: error.message });
  }
}

// GET - por id_asistencia
export async function obtenerAsistenciaEstudiantePorId(req, res) {
  try {
    const registro =
      await AsistenciaEstService.obtenerAsistenciaEstudiantePorId(
        req.params.id
      );
    if (!registro) {
      return res
        .status(404)
        .json({ error: "Registro de asistencia de estudiante no encontrado" });
    }
    res.json(registro);
  } catch (error) {
    console.error(">>> ERROR obtenerAsistenciaEstudiantePorId:", error);
    res.status(500).json({ error: error.message });
  }
}

// GET - por estudiante (con rango de fechas opcional)
export async function obtenerAsistenciasPorEstudiante(req, res) {
  try {
    const { desde, hasta } = req.query;
    const data = await AsistenciaEstService.obtenerAsistenciasPorEstudiante(
      req.params.id_estudiante,
      { desde, hasta }
    );
    res.json(data);
  } catch (error) {
    console.error(">>> ERROR obtenerAsistenciasPorEstudiante:", error);
    res.status(500).json({ error: error.message });
  }
}

// GET - por aula
export async function obtenerAsistenciasPorAula(req, res) {
  try {
    const data = await AsistenciaEstService.obtenerAsistenciasPorAula(
      req.params.id_aula
    );
    res.json(data);
  } catch (error) {
    console.error(">>> ERROR obtenerAsistenciasPorAula:", error);
    res.status(500).json({ error: error.message });
  }
}

// POST - crear asistencia
export async function crearAsistenciaEstudiante(req, res) {
  try {
    const nuevo = await AsistenciaEstService.crearAsistenciaEstudiante(
      req.body
    );
    res.status(201).json(nuevo);
  } catch (error) {
    console.error(">>> ERROR crearAsistenciaEstudiante:", error);
    if (error.tipo === "VALIDACION") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// PUT - actualizar
export async function actualizarAsistenciaEstudiante(req, res) {
  try {
    const actualizado =
      await AsistenciaEstService.actualizarAsistenciaEstudiante(
        req.params.id,
        req.body
      );
    res.json(actualizado);
  } catch (error) {
    console.error(">>> ERROR actualizarAsistenciaEstudiante:", error);
    if (error.tipo === "VALIDACION") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// DELETE - eliminar
export async function eliminarAsistenciaEstudiante(req, res) {
  try {
    const eliminado =
      await AsistenciaEstService.eliminarAsistenciaEstudiante(req.params.id);
    res.json(eliminado);
  } catch (error) {
    console.error(">>> ERROR eliminarAsistenciaEstudiante:", error);
    res.status(500).json({ error: error.message });
  }
}
