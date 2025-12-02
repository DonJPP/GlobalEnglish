import * as CambioTutorService from "../services/cambioTutor.services.js";

// GET - todos los cambios
export async function obtenerCambiosTutor(req, res) {
  try {
    const cambios = await CambioTutorService.obtenerCambiosTutor();
    res.json(cambios);
  } catch (error) {
    console.error(">>> ERROR obtenerCambiosTutor:", error);
    res.status(500).json({ error: error.message });
  }
}

// GET - cambio por ID
export async function obtenerCambioTutorPorId(req, res) {
  try {
    const cambio = await CambioTutorService.obtenerCambioTutorPorId(
      req.params.id
    );
    if (!cambio) {
      return res.status(404).json({ error: "Cambio de tutor no encontrado" });
    }
    res.json(cambio);
  } catch (error) {
    console.error(">>> ERROR obtenerCambioTutorPorId:", error);
    res.status(500).json({ error: error.message });
  }
}

// GET - cambios por aula
export async function obtenerCambiosPorAula(req, res) {
  try {
    const cambios = await CambioTutorService.obtenerCambiosPorAula(
      req.params.id_aula
    );
    res.json(cambios);
  } catch (error) {
    console.error(">>> ERROR obtenerCambiosPorAula:", error);
    res.status(500).json({ error: error.message });
  }
}

// POST - crear cambio de tutor
export async function crearCambioTutor(req, res) {
  try {
    const nuevo = await CambioTutorService.crearCambioTutor(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    console.error(">>> ERROR crearCambioTutor:", error);
    if (error.tipo === "VALIDACION") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// DELETE - eliminar cambio (opcional)
export async function eliminarCambioTutor(req, res) {
  try {
    const eliminado = await CambioTutorService.eliminarCambioTutor(
      req.params.id
    );
    res.json(eliminado);
  } catch (error) {
    console.error(">>> ERROR eliminarCambioTutor:", error);
    res.status(500).json({ error: error.message });
  }
}
