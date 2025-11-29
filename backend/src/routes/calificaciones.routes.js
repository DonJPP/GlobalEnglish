import express from "express";
import {
  obtenerCalificaciones,
  obtenerCalificacionPorId,
  obtenerCalificacionesPorEstudiante,
  crearCalificacion,
  actualizarCalificacion,
  eliminarCalificacion,
} from "../controllers/calificaciones.controller.js";

console.log(">>> Cargando calificaciones.routes.js");

const router = express.Router();

// CRUD básico
router.get("/", obtenerCalificaciones);
router.get("/:id", obtenerCalificacionPorId);
router.post("/", crearCalificacion);
router.put("/:id", actualizarCalificacion);
router.delete("/:id", eliminarCalificacion);

// Historial por estudiante
router.get("/estudiante/:id_estudiante/lista", obtenerCalificacionesPorEstudiante);

export default router;
