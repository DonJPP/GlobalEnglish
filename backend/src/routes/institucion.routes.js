import express from "express";
import {
  obtenerInstituciones,
  obtenerInstitucionPorId,
  crearInstitucion,
  actualizarInstitucion,
  eliminarInstitucion,
} from "../controllers/institucion.controller.js";

console.log(">>> Cargando institucion.routes.js");

const router = express.Router();

router.get("/", obtenerInstituciones);
router.get("/:id", obtenerInstitucionPorId);
router.post("/", crearInstitucion);
router.put("/:id", actualizarInstitucion);
router.delete("/:id", eliminarInstitucion);

export default router;
