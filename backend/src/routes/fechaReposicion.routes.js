import express from "express";
import {
  obtenerReposiciones,
  obtenerReposicionPorId,
  obtenerReposicionesPorAsistencia,
  crearReposicion,
  actualizarReposicion,
  eliminarReposicion,
} from "../controllers/fechaReposicion.controller.js";

console.log(">>> Cargando fechaReposicion.routes.js");

const router = express.Router();

// CRUD básico
router.get("/", obtenerReposiciones);
router.get("/:id", obtenerReposicionPorId);
router.post("/", crearReposicion);
router.put("/:id", actualizarReposicion);
router.delete("/:id", eliminarReposicion);

// Filtro por id_asistencia (ver reposición asociada a una inasistencia)
router.get("/asistencia/:id_asistencia", obtenerReposicionesPorAsistencia);

export default router;
