import "dotenv/config";  
import app from "./app.js";

const PORT = process.env.PORT || 3000;

console.log(">>> ESTE ES EL SERVER.JS QUE SE EJECUTA");


app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
