import express from "express";
import {
  obtenerAsistenciasEstudiante,
  obtenerAsistenciaEstudiantePorId,
  obtenerAsistenciasPorEstudiante,
  obtenerAsistenciasPorAula,
  crearAsistenciaEstudiante,
  actualizarAsistenciaEstudiante,
  eliminarAsistenciaEstudiante,
} from "../controllers/asistenciaEstudiante.controller.js";

console.log(">>> Cargando asistenciaEstudiante.routes.js");

const router = express.Router();

// CRUD básico
router.get("/", obtenerAsistenciasEstudiante);
router.get("/:id", obtenerAsistenciaEstudiantePorId);
router.post("/", crearAsistenciaEstudiante);
router.put("/:id", actualizarAsistenciaEstudiante);
router.delete("/:id", eliminarAsistenciaEstudiante);

// Filtros
router.get("/estudiante/:id_estudiante/lista", obtenerAsistenciasPorEstudiante);
router.get("/aula/:id_aula/lista", obtenerAsistenciasPorAula);

export default router;
