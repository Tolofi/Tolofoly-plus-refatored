import { useGameStore } from "../my-app/src/store";
import io from "socket.io-client";

const getSavedURL = () => {
  const ip = localStorage.getItem("socketIp");
  const porta = localStorage.getItem("socketPorta");
  return ip && porta ? `http://${ip}:${porta}` : "http://192.168.2.166:3000";
};

// Iniciamos com o que estiver salvo ou o padrão
export const socket = io(getSavedURL(), {
  autoConnect: true,
});

// // FUNÇÃO NOVA: Para atualizar a conexão dinamicamente
// export const connectToNewServer = (ip, porta) => {
//   socket.io.uri = `http://${ip}:${porta}`; // Altera a URL interna
//   socket.disconnect(); // Desconecta do antigo
//   socket.connect(); // Conecta no novo
// };

// --- LISTENERS GLOBAIS ---

socket.on("connect", () => {
  console.log("🟢 Conectado ao servidor:", socket.io.uri);
});

socket.on("playerUpdate", (player) => {
  useGameStore.getState().setMeAsObject(player);
});

socket.on("propertiesUpdate", (properties) => {
  const store = useGameStore.getState();
  if (store.updateProperties) {
    store.updateProperties(properties);
  } else if (store.setProperties) {
    store.setProperties(properties);
  }
});

socket.on("allPlayersUpdate", (players) => {
  const store = useGameStore.getState();
  if (store.updatePlayersArray) {
    store.updatePlayersArray(players);
  } else if (store.setPlayers) {
    store.setPlayers(players);
  }
})

socket.on("historyIncrement", (item) => {
  useGameStore.getState().addHistoryItem(item);
});
