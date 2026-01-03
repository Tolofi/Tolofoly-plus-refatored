import { createServer } from "http";
import { Server } from "socket.io";
import { SocketAdmin } from "./classes/SocketAdmin.js";
import { Memory } from "./classes/Memory.js";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

// instância ÚNICA
new SocketAdmin(io);

Memory.initializeProperties();
// console.log(Memory.getAllPropertiesByArray());
// console.log(Memory.players);

httpServer.listen(3000, () => {
  console.log("Servidor rodando");
});
