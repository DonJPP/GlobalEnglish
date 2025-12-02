import * as AsistenciaTutorService from "../services/asistenciaTutor.services.js";

// GET - todas las asistencias
export async function obtenerAsistenciasTutor(req, res) {
  try {
    const data = await AsistenciaTutorService.obtenerAsistenciasTutor();
    res.json(data);
  } catch (error) {
    console.error(">>> ERROR obtenerAsistenciasTutor:", error);
    res.status(500).json({ error: error.message });
  }
}

// GET - por ID
export async function obtenerAsistenciaTutorPorId(req, res) {
  try {
    const registro = await AsistenciaTutorService.obtenerAsistenciaTutorPorId(
      req.params.id
    );
    if (!registro) {
      return res
        .status(404)
        .json({ error: "Registro de asistencia no encontrado" });
    }
    res.json(registro);
  } catch (error) {
    console.error(">>> ERROR obtenerAsistenciaTutorPorId:", error);
    res.status(500).json({ error: error.message });
  }
}

// GET - asistencias por tutor (con filtros opcionales)
export async function obtenerAsistenciasPorTutor(req, res) {
  try {
    const { desde, hasta } = req.query;
    const data = await AsistenciaTutorService.obtenerAsistenciasPorTutor(
      req.params.id_tutor,
      { desde, hasta }
    );
    res.json(data);
  } catch (error) {
    console.error(">>> ERROR obtenerAsistenciasPorTutor:", error);
    res.status(500).json({ error: error.message });
  }
}

// GET - asistencias por aula
export async function obtenerAsistenciasPorAula(req, res) {
  try {
    const data = await AsistenciaTutorService.obtenerAsistenciasPorAula(
      req.params.id_aula
    );
    res.json(data);
  } catch (error) {
    console.error(">>> ERROR obtenerAsistenciasPorAula:", error);
    res.status(500).json({ error: error.message });
  }
}

// POST - crear asistencia
export async function crearAsistenciaTutor(req, res) {
  try {
    const nuevo = await AsistenciaTutorService.crearAsistenciaTutor(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    console.error(">>> ERROR crearAsistenciaTutor:", error);
    if (error.tipo === "VALIDACION") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// PUT - actualizar asistencia
export async function actualizarAsistenciaTutor(req, res) {
  try {
    const actualizado =
      await AsistenciaTutorService.actualizarAsistenciaTutor(
        req.params.id,
        req.body
      );
    res.json(actualizado);
  } catch (error) {
    console.error(">>> ERROR actualizarAsistenciaTutor:", error);
    if (error.tipo === "VALIDACION") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// DELETE - eliminar asistencia
export async function eliminarAsistenciaTutor(req, res) {
  try {
    const eliminado =
      await AsistenciaTutorService.eliminarAsistenciaTutor(req.params.id);
    res.json(eliminado);
  } catch (error) {
    console.error(">>> ERROR eliminarAsistenciaTutor:", error);
    res.status(500).json({ error: error.message });
  }
}
