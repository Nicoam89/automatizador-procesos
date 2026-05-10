import http from "http";

import app from "./app.js";

import { Server }
  from "socket.io";

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

server.listen(PORT, () => {

  console.log(
    `Servidor corriendo en puerto ${PORT}`
  );
});