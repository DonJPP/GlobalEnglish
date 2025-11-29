import express from "express";
import {
  obtenerSedes,
  obtenerSedePorId,
  crearSede,
  actualizarSede,
  eliminarSede
} from "../controllers/sede.controller.js";

console.log(">>> Cargando sede.routes.js");

const router = express.Router();

router.get("/", obtenerSedes);
router.get("/:id", obtenerSedePorId);
router.post("/", crearSede);
router.put("/:id", actualizarSede);
router.delete("/:id", eliminarSede);

export default router;
