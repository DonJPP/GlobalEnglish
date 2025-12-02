import express from "express";
import tutorRoutes from "./routes/tutor.routes.js";
import cors from "cors";
import estudiantesRoutes from "./routes/estudiante.routes.js";
import administrativoRoutes from "./routes/administrativo.routes.js";
import institucionRoutes from "./routes/institucion.routes.js";
import sedeRoutes from "./routes/sede.routes.js";
import aulaRoutes from "./routes/aula.routes.js";
import horarioRoutes from "./routes/horario.routes.js";
import asignacionRoutes from "./routes/asignacion.routes.js";
import cambioTutorRoutes from "./routes/cambioTutor.routes.js";
import asistenciaTutorRoutes from "./routes/asistenciaTutor.routes.js";
import asistenciaEstudianteRoutes from "./routes/asistenciaEstudiante.routes.js";
import calificacionesRoutes from "./routes/calificaciones.routes.js";
import motivoRoutes from "./routes/motivoInasistencia.routes.js";
import fechaReposicionRoutes from "./routes/fechaReposicion.routes.js";
import reportesRoutes from "./routes/reportes.routes.js";
import authRoutes from "./routes/auth.routes.js";


console.log(">>> ESTE ES EL APP.JS QUE ESTÁ CORRIENDO");




const app = express();


app.use(express.json());
app.use(cors());

console.log("Cargando rutas...");
app.use("/api/tutores", tutorRoutes);
app.use("/api/estudiantes", estudiantesRoutes);
app.use("/api/administrativos", administrativoRoutes);
app.use("/api/instituciones", institucionRoutes);
app.use("/api/sedes", sedeRoutes);
app.use("/api/aulas", aulaRoutes);
app.use("/api/horarios", horarioRoutes);
app.use("/api/asignaciones", asignacionRoutes);
app.use("/api/cambios-tutor", cambioTutorRoutes);
app.use("/api/asistencia-tutor", asistenciaTutorRoutes);
app.use("/api/asistencia-estudiante", asistenciaEstudianteRoutes);
app.use("/api/calificaciones", calificacionesRoutes);
app.use("/api/motivos-inasistencia", motivoRoutes);
app.use("/api/fecha-reposicion", fechaReposicionRoutes);
app.use("/api/reportes", reportesRoutes);
app.use("/api/auth", authRoutes);


app.get("/test", (req, res) => {
  console.log(">>> Entró al endpoint /test");
  res.send("OK");
});

console.log("Rutas cargadas correctamente.");


export default app;
