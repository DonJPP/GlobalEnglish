import express from "express";
import {
  obtenerAsignaciones,
  obtenerAsignacionPorId,
  obtenerAsignacionesPorAula,
  obtenerAsignacionesPorTutor,
  crearAsignacion,
  actualizarAsignacion,
  eliminarAsignacion,
} from "../controllers/asignacion.controller.js";

console.log(">>> Cargando asignacion.routes.js");

const router = express.Router();

// CRUD principal
router.get("/", obtenerAsignaciones);
router.get("/:id", obtenerAsignacionPorId);
router.post("/", crearAsignacion);
router.put("/:id", actualizarAsignacion);
router.delete("/:id", eliminarAsignacion);

// Otras consultas
router.get("/aula/:id_aula", obtenerAsignacionesPorAula);
router.get("/tutor/:id_tutor", obtenerAsignacionesPorTutor);

export default router;
