import * as MotivoService from "../services/motivoInasistencia.services.js";

export async function obtenerMotivos(req, res) {
  try {
    const data = await MotivoService.obtenerMotivos();
    res.json(data);
  } catch (error) {
    console.error(">>> ERROR obtenerMotivos:", error);
    res.status(500).json({ error: error.message });
  }
}

export async function obtenerMotivoPorId(req, res) {
  try {
    const motivo = await MotivoService.obtenerMotivoPorId(req.params.id);
    if (!motivo) {
      return res.status(404).json({ error: "Motivo no encontrado" });
    }
    res.json(motivo);
  } catch (error) {
    console.error(">>> ERROR obtenerMotivoPorId:", error);
    res.status(500).json({ error: error.message });
  }
}

export async function crearMotivo(req, res) {
  try {
    const nuevo = await MotivoService.crearMotivo(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    console.error(">>> ERROR crearMotivo:", error);
    if (error.tipo === "VALIDACION") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

export async function actualizarMotivo(req, res) {
  try {
    const actualizado = await MotivoService.actualizarMotivo(
      req.params.id,
      req.body
    );
    res.json(actualizado);
  } catch (error) {
    console.error(">>> ERROR actualizarMotivo:", error);
    if (error.tipo === "VALIDACION") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

export async function eliminarMotivo(req, res) {
  try {
    const eliminado = await MotivoService.eliminarMotivo(req.params.id);
    res.json(eliminado);
  } catch (error) {
    console.error(">>> ERROR eliminarMotivo:", error);
    res.status(500).json({ error: error.message });
  }
}
