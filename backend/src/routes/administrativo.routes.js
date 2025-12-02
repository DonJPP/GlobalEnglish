import express from "express";
import {
  obtenerAdministrativos,
  obtenerAdministrativoPorId,
  crearAdministrativo,
  actualizarAdministrativo,
  eliminarAdministrativo,
} from "../controllers/administrativo.controller.js";

console.log(">>> Cargando administrativo.routes.js");

const router = express.Router();

router.get("/", obtenerAdministrativos);
router.get("/:id", obtenerAdministrativoPorId);
router.post("/", crearAdministrativo);
router.put("/:id", actualizarAdministrativo);
router.delete("/:id", eliminarAdministrativo);

export default router;
