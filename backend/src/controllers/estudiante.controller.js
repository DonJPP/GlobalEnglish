import * as EstudianteService from "../services/estudiante.services.js";

// GET - Todos los estudiantes
export async function obtenerEstudiantes(req, res) {
  try {
    const estudiantes = await EstudianteService.obtenerEstudiantes();
    res.json(estudiantes);
  } catch (error) {
    console.error(">>> ERROR en obtenerEstudiantes:", error);
    res.status(500).json({ error: error.message });
  }
}

// GET - Estudiante por ID
export async function obtenerEstudiantePorId(req, res) {
  try {
    const estudiante = await EstudianteService.obtenerEstudiantePorId(
      req.params.id
    );

    if (!estudiante) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }

    res.json(estudiante);
  } catch (error) {
    console.error(">>> ERROR en obtenerEstudiantePorId:", error);
    res.status(500).json({ error: error.message });
  }
}

// POST - Crear estudiante
export async function crearEstudiante(req, res) {
  try {
    console.log(">>> Body recibido en crearEstudiante:", req.body);
    const nuevoEstudiante = await EstudianteService.crearEstudiante(req.body);
    res.status(201).json(nuevoEstudiante);
  } catch (error) {
    console.error(">>> ERROR en crearEstudiante:", error);
    res.status(500).json({ error: error.message });
  }
}

// PUT - Actualizar estudiante
export async function actualizarEstudiante(req, res) {
  try {
    const actualizado = await EstudianteService.actualizarEstudiante(
      req.params.id,
      req.body
    );
    res.json(actualizado);
  } catch (error) {
    console.error(">>> ERROR en actualizarEstudiante:", error);
    res.status(500).json({ error: error.message });
  }
}

// DELETE - Eliminar estudiante
export async function eliminarEstudiante(req, res) {
  try {
    const eliminado = await EstudianteService.eliminarEstudiante(req.params.id);
    res.json(eliminado);
  } catch (error) {
    console.error(">>> ERROR en eliminarEstudiante:", error);
    res.status(500).json({ error: error.message });
  }
}
