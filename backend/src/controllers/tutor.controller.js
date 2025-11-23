import * as TutorService from "../services/tutor.services.js";

// GET - Todos los tutores
export async function obtenerTutores(req, res) {
  console.log(">>> Entró a obtenerTutores CONTROLLER");
  try {
    const tutores = await TutorService.obtenerTutores();
    res.json(tutores);
  } catch (error) {
    console.error(">>> ERROR en controller:", error);
    res.status(500).json({ error: error.message });
  }
}


// GET - Tutor por ID
export async function obtenerTutorPorId(req, res) {
  try {
    const tutor = await TutorService.obtenerTutorPorId(req.params.id);
    if (!tutor) return res.status(404).json({ error: "Tutor no encontrado" });
    res.json(tutor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// POST - Crear tutor
export async function crearTutor(req, res) {
  try {
    const nuevoTutor = await TutorService.crearTutor(req.body);
    res.status(201).json(nuevoTutor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// PUT - Actualizar tutor
export async function actualizarTutor(req, res) {
  try {
    const actualizado = await TutorService.actualizarTutor(req.params.id, req.body);
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// DELETE - Eliminar tutor
export async function eliminarTutor(req, res) {
  try {
    const eliminado = await TutorService.eliminarTutor(req.params.id);
    res.json(eliminado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
