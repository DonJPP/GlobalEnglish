import express from "express";
import {
  obtenerTutores,
  obtenerTutorPorId,
  crearTutor,
  actualizarTutor,
  eliminarTutor
} from "../controllers/tutor.controller.js";

console.log(">>> Cargando tutor.routes.js");


const router = express.Router();

router.get("/", obtenerTutores);
router.get("/:id", obtenerTutorPorId);
router.post("/", crearTutor);
router.put("/:id", actualizarTutor);
router.delete("/:id", eliminarTutor);

export default router;
