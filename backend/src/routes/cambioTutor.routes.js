import express from "express";
import {
  obtenerCambiosTutor,
  obtenerCambioTutorPorId,
  obtenerCambiosPorAula,
  crearCambioTutor,
  eliminarCambioTutor,
} from "../controllers/cambioTutor.controller.js";

console.log(">>> Cargando cambioTutor.routes.js");

const router = express.Router();

// Listar todos los cambios
router.get("/", obtenerCambiosTutor);

// Ver un cambio específico
router.get("/:id", obtenerCambioTutorPorId);

// Ver cambios por aula
router.get("/aula/:id_aula", obtenerCambiosPorAula);

// Crear un cambio de tutor
router.post("/", crearCambioTutor);

// Eliminar un cambio (opcional)
router.delete("/:id", eliminarCambioTutor);

export default router;
