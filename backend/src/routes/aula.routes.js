import express from "express";
import {
  obtenerAulas,
  obtenerAulaPorId,
  crearAula,
  actualizarAula,
  eliminarAula,
} from "../controllers/aula.controller.js";

console.log(">>> Cargando aula.routes.js");

const router = express.Router();

router.get("/", obtenerAulas);
router.get("/:id", obtenerAulaPorId);
router.post("/", crearAula);
router.put("/:id", actualizarAula);
router.delete("/:id", eliminarAula);

export default router;
