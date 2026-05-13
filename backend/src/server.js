import http from "http";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import app from "./app.js";
import { setIo } from "./socket.js";
import connectDB from "./config/db.js";

import { Server }
  from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
  override: false,
});

const PORT =
  process.env.PORT || 5000;

const server =
  http.createServer(app);

export const io =
  new Server(server, {

    cors: {
      origin:
        "http://localhost:5173",
    },
  });

setIo(io);

const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error(
      "No se pudo conectar a MongoDB:",
      error.message
    );
  }

  server.listen(PORT, () => {
    console.log(
      `Servidor corriendo en puerto ${PORT}`
    );
  });
};

startServer();
