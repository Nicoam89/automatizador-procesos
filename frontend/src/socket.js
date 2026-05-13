import { io }
  from "./lib/socketClient";

const socket = io(
  "http://localhost:5000"
);

export default socket;
