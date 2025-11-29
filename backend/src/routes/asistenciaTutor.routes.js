import express from "express";
import {
  obtenerAsistenciasTutor,
  obtenerAsistenciaTutorPorId,
  obtenerAsistenciasPorTutor,
  obtenerAsistenciasPorAula,
  crearAsistenciaTutor,
  actualizarAsistenciaTutor,
  eliminarAsistenciaTutor,
} from "../controllers/asistenciaTutor.controller.js";

console.log(">>> Cargando asistenciaTutor.routes.js");

const router = express.Router();

// CRUD básico
router.get("/", obtenerAsistenciasTutor);
router.get("/:id", obtenerAsistenciaTutorPorId);
router.post("/", crearAsistenciaTutor);
router.put("/:id", actualizarAsistenciaTutor);
router.delete("/:id", eliminarAsistenciaTutor);

// otras consultas
router.get("/tutor/:id_tutor/lista", obtenerAsistenciasPorTutor);
router.get("/aula/:id_aula/lista", obtenerAsistenciasPorAula);

export default router;
