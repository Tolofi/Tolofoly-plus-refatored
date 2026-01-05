import { createServer } from "http";
import { Server } from "socket.io";
import { SocketAdmin } from "./classes/SocketAdmin.js";
import { Memory } from "./classes/Memory.js";

const PORT = 3000
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Permite que qualquer dispositivo (celular/PC) conecte
    methods: ["GET", "POST"],
  },
});

// instância ÚNICA
new SocketAdmin(io);

Memory.initializeProperties();
// console.log(Memory.getAllPropertiesByArray());
// console.log(Memory.players);

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando no IP: ${PORT}`);
});
