import express from "express";
import {
  getReporteAsistenciaAula,
  getReporteAsistenciaEstudiante,
  getReporteNotasEstudiante,
} from "../controllers/reportes.controller.js";

console.log(">>> Cargando reportes.routes.js");

const router = express.Router();

// Asistencia por aula (filtrable por institución, aula y fechas)
router.get("/asistencia-aula", getReporteAsistenciaAula);

// Asistencia por estudiante
router.get("/asistencia-estudiante/:id_estudiante", getReporteAsistenciaEstudiante);

// Notas por estudiante (boletín)
router.get("/notas-estudiante/:id_estudiante", getReporteNotasEstudiante);

export default router;
