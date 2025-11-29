import * as SedeService from "../services/sede.services.js";

export async function obtenerSedes(req, res) {
  try {
    const sedes = await SedeService.obtenerSedes();
    res.json(sedes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function obtenerSedePorId(req, res) {
  try {
    const sede = await SedeService.obtenerSedePorId(req.params.id);
    if (!sede) return res.status(404).json({ error: "Sede no encontrada" });
    res.json(sede);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function crearSede(req, res) {
  try {
    const nueva = await SedeService.crearSede(req.body);
    res.status(201).json(nueva);
  } catch (error) {
    if (error.tipo === "VALIDACION")
      return res.status(400).json({ error: error.message });

    res.status(500).json({ error: error.message });
  }
}

export async function actualizarSede(req, res) {
  try {
    const actualizada = await SedeService.actualizarSede(
      req.params.id,
      req.body
    );
    res.json(actualizada);
  } catch (error) {
    if (error.tipo === "VALIDACION")
      return res.status(400).json({ error: error.message });

    res.status(500).json({ error: error.message });
  }
}

export async function eliminarSede(req, res) {
  try {
    const eliminado = await SedeService.eliminarSede(req.params.id);
    res.json(eliminado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
