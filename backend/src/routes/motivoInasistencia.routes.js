import express from "express";
import {
  obtenerMotivos,
  obtenerMotivoPorId,
  crearMotivo,
  actualizarMotivo,
  eliminarMotivo,
} from "../controllers/motivoInasistencia.controller.js";

console.log(">>> Cargando motivoInasistencia.routes.js");

const router = express.Router();

router.get("/", obtenerMotivos);
router.get("/:id", obtenerMotivoPorId);
router.post("/", crearMotivo);
router.put("/:id", actualizarMotivo);
router.delete("/:id", eliminarMotivo);

export default router;
