import express from "express";
import tutorRoutes from "./routes/tutor.routes.js";

console.log(">>> ESTE ES EL APP.JS QUE ESTÁ CORRIENDO");

const app = express();


app.use(express.json());

console.log("Cargando rutas...");

app.use("/api/tutores", tutorRoutes);
app.get("/test", (req, res) => {
  console.log(">>> Entró al endpoint /test");
  res.send("OK");
});


console.log("Rutas cargadas correctamente.");


export default app;
