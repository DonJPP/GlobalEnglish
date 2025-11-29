import express from "express";
import tutorRoutes from "./routes/tutor.routes.js";
import estudiantesRoutes from "./routes/estudiante.routes.js";
import administrativoRoutes from "./routes/administrativo.routes.js";
import institucionRoutes from "./routes/institucion.routes.js";
import sedeRoutes from "./routes/sede.routes.js";
import aulaRoutes from "./routes/aula.routes.js";
import horarioRoutes from "./routes/horario.routes.js";


console.log(">>> ESTE ES EL APP.JS QUE ESTÁ CORRIENDO");

const app = express();


app.use(express.json());

console.log("Cargando rutas...");
app.use("/api/tutores", tutorRoutes);
app.use("/api/estudiantes" , estudiantesRoutes);
app.use("/api/administrativos", administrativoRoutes);
app.use("/api/instituciones", institucionRoutes);
app.use("/api/sedes", sedeRoutes);
app.use("/api/aulas", aulaRoutes);
app.use("/api/horarios", horarioRoutes);

app.get("/test", (req, res) => {
  console.log(">>> Entró al endpoint /test");
  res.send("OK");
});

console.log("Rutas cargadas correctamente.");


export default app;
