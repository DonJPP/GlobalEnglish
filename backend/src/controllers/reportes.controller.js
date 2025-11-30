import {
  reporteAsistenciaAula,
  reporteAsistenciaEstudiante,
  reporteNotasEstudiante,
} from "../services/reportes.services.js";

// GET /api/reportes/asistencia-aula
export async function getReporteAsistenciaAula(req, res) {
  try {
    const { id_institucion, id_aula, desde, hasta } = req.query;
    const data = await reporteAsistenciaAula({ id_institucion, id_aula, desde, hasta });
    res.json(data);
  } catch (error) {
    console.error(">>> ERROR getReporteAsistenciaAula:", error);
    if (error.tipo === "VALIDACION") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// GET /api/reportes/asistencia-estudiante/:id_estudiante
export async function getReporteAsistenciaEstudiante(req, res) {
  try {
    const { desde, hasta } = req.query;
    const { id_estudiante } = req.params;

    const data = await reporteAsistenciaEstudiante({
      id_estudiante,
      desde,
      hasta,
    });

    res.json(data);
  } catch (error) {
    console.error(">>> ERROR getReporteAsistenciaEstudiante:", error);
    if (error.tipo === "VALIDACION") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// GET /api/reportes/notas-estudiante/:id_estudiante
export async function getReporteNotasEstudiante(req, res) {
  try {
    const { desde, hasta } = req.query;
    const { id_estudiante } = req.params;

    const data = await reporteNotasEstudiante({
      id_estudiante,
      desde,
      hasta,
    });

    res.json(data);
  } catch (error) {
    console.error(">>> ERROR getReporteNotasEstudiante:", error);
    if (error.tipo === "VALIDACION") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}
