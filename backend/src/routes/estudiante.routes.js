import express from "express";
import {
  obtenerEstudiantes,
  obtenerEstudiantePorId,
  crearEstudiante,
  actualizarEstudiante,
  eliminarEstudiante
} from "../controllers/estudiante.controller.js";

console.log(">>> Cargando estudiante.routes.js");

const router = express.Router();


router.get("/", obtenerEstudiantes);
router.get("/:id", obtenerEstudiantePorId);
router.post("/", crearEstudiante);
router.put("/:id", actualizarEstudiante);
router.delete("/:id", eliminarEstudiante);

export default router;


