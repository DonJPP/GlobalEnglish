import { Router } from "express";
import {
  getReporteHorarioTutor,
  getReporteAsistenciaAula,
  getReporteAsistenciaEstudiante,
  getReporteNotasEstudiante,
  getReporteAsistenciaTutor,
  getNotasTutor,
  getReporteHorarioAula
} from "../controllers/reportes.controller.js";

const router = Router();

// Horario de un aula
router.get("/horario-aula/:id_aula", getReporteHorarioAula);

// Horario tutor
router.get("/horario-tutor/:id_tutor", getReporteHorarioTutor);

// Asistencia por aula
router.get("/asistencia-aula", getReporteAsistenciaAula);

// Asistencia por estudiante
router.get("/asistencia-estudiante/:id_estudiante", getReporteAsistenciaEstudiante);

// Notas por estudiante
router.get("/notas-estudiante/:id_estudiante", getReporteNotasEstudiante);

// Asistencia del tutor
router.get("/asistencia-tutor/:id_tutor", getReporteAsistenciaTutor);

// Notas tomadas por un tutor
router.get("/notas-tutor/:id_tutor", getNotasTutor);

export default router;
