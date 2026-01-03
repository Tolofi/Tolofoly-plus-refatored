import { useGameStore } from "../my-app/src/store"; // Ajuste o caminho se necessário
import io from "socket.io-client";

// --- LÓGICA DE URL DINÂMICA ---

// 1. Tenta pegar o parâmetro '?server=' da URL do navegador
const params = new URLSearchParams(window.location.search);
const serverParam = params.get("server");

// 2. Define o padrão caso não tenha parâmetro
const DEFAULT_URL = "http://192.168.2.166:3000";

// 3. Monta a URL final
// Se o usuário passou param, usa ele. Se não passou 'http', a gente adiciona.
const getApiUrl = () => {
  if (!serverParam) return DEFAULT_URL;

  // Verifica se já tem protocolo, se não, adiciona http://
  return serverParam.startsWith("http") ? serverParam : `http://${serverParam}`;
};

const API_URL = getApiUrl();

console.log("🔌 Configuração do Socket:");
console.log("   - Alvo:", API_URL);
console.log("   - Para mudar, use: ?server=SEU_IP:PORTA");

export const socket = io(API_URL, {
  autoConnect: false, // Evita conectar sozinho antes da hora
});

// --- LISTENERS GLOBAIS ---

socket.on("playerUpdate", (player) => {
  // console.log("playerUpdate global:", player);
  useGameStore.getState().setMeAsObject(player);
});

socket.on("propertiesUpdate", (properties) => {
  // console.log("propertiesUpdate global:", properties);
  // Garante que o store tenha esse método (vimos isso nos passos anteriores)
  if (useGameStore.getState().updateProperties) {
    useGameStore.getState().updateProperties(properties);
  } else if (useGameStore.getState().setProperties) {
    useGameStore.getState().setProperties(properties);
  }
});

socket.on("historyIncrement", (item) => {
  // console.log("Item: ", item);
  useGameStore.getState().addHistoryItem(item);
});
