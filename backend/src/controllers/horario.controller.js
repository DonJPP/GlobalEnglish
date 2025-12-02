import * as HorarioService from "../services/horario.services.js";

// GET - todos
export async function obtenerHorarios(req, res) {
  try {
    const horarios = await HorarioService.obtenerHorarios();
    res.json(horarios);
  } catch (error) {
    console.error(">>> ERROR obtenerHorarios:", error);
    res.status(500).json({ error: error.message });
  }
}

// GET - por ID
export async function obtenerHorarioPorId(req, res) {
  try {
    const horario = await HorarioService.obtenerHorarioPorId(req.params.id);
    if (!horario) {
      return res.status(404).json({ error: "Horario no encontrado" });
    }
    res.json(horario);
  } catch (error) {
    console.error(">>> ERROR obtenerHorarioPorId:", error);
    res.status(500).json({ error: error.message });
  }
}

// POST - crear
export async function crearHorario(req, res) {
  try {
    const nuevo = await HorarioService.crearHorario(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    console.error(">>> ERROR crearHorario:", error);
    if (error.tipo === "VALIDACION") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// PUT - actualizar
export async function actualizarHorario(req, res) {
  try {
    const actualizado = await HorarioService.actualizarHorario(
      req.params.id,
      req.body
    );
    res.json(actualizado);
  } catch (error) {
    console.error(">>> ERROR actualizarHorario:", error);
    if (error.tipo === "VALIDACION") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// DELETE - eliminar
export async function eliminarHorario(req, res) {
  try {
    const eliminado = await HorarioService.eliminarHorario(req.params.id);
    res.json(eliminado);
  } catch (error) {
    console.error(">>> ERROR eliminarHorario:", error);
    res.status(500).json({ error: error.message });
  }
}
