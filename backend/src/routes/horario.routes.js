import express from "express";
import {
  obtenerHorarios,
  obtenerHorarioPorId,
  crearHorario,
  actualizarHorario,
  eliminarHorario,
} from "../controllers/horario.controller.js";

console.log(">>> Cargando horario.routes.js");

const router = express.Router();

router.get("/", obtenerHorarios);
router.get("/:id", obtenerHorarioPorId);
router.post("/", crearHorario);
router.put("/:id", actualizarHorario);
router.delete("/:id", eliminarHorario);

export default router;
