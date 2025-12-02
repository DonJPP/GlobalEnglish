import {
  reporteAsistenciaAula,
  reporteAsistenciaEstudiante,
  reporteNotasEstudiante,
  reporteHorarioTutor,
  reporteAsistenciaTutor,
  reporteNotasTutor,
  reporteHorarioAula
} from "../services/reportes.services.js";


/** ================= HORARIO DE UN AULA ================= **/
export async function getReporteHorarioAula(req, res) {
  try {
    const { id_aula } = req.params;

    const data = await reporteHorarioAula(id_aula);

    if (!data || data.length === 0) {
      return res.status(404).json({
        mensaje: "El aula no tiene horarios registrados o no existe."
      });
    }

    res.json(data);

  } catch (error) {
    console.error("ERROR getReporteHorarioAula:", error);
    if (error.tipo === "VALIDACION") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

/** ================= HORARIO TUTOR ================= **/
export async function getReporteHorarioTutor(req, res) {
  try {
    const { id_tutor } = req.params;
    const data = await reporteHorarioTutor(id_tutor);

    if (data.length === 0) {
      return res.status(404).json({
        mensaje: "El tutor no tiene aulas/horarios asignados o no existe.",
      });
    }

    res.json(data);
  } catch (error) {
    console.error(">>> ERROR getReporteHorarioTutor:", error);
    if (error.tipo === "VALIDACION") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

/** ================= ASISTENCIA POR AULA ================= **/
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

/** ================= ASISTENCIA ESTUDIANTE ================= **/
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

/** ================= NOTAS ESTUDIANTE ================= **/
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

/** ================= ASISTENCIA TUTOR ================= **/
export async function getReporteAsistenciaTutor(req, res) {
  try {
    const { id_tutor } = req.params;

    const data = await reporteAsistenciaTutor({ id_tutor });

    if (data.length === 0) {
      return res.status(404).json({
        mensaje: "El tutor no tiene asistencias registradas.",
      });
    }

    res.json(data);
  } catch (error) {
    console.error(">>> ERROR getReporteAsistenciaTutor:", error);
    if (error.tipo === "VALIDACION") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

/** ================= NOTAS TUTOR ================= **/
export async function getNotasTutor(req, res) {
  try {
    const { id_tutor } = req.params;
    const { desde, hasta } = req.query;

    const datos = await reporteNotasTutor({
      id_tutor,
      desde,
      hasta,
    });

    if (!datos || datos.length === 0) {
      return res.status(404).json({
        mensaje: "El tutor no tiene calificaciones registradas en ese rango.",
      });
    }

    res.json(datos);

  } catch (error) {
    console.error("Error en getNotasTutor:", error);
    res.status(500).json({
      error: error.message || "Error interno"
    });
  }
}
