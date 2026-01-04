import { useGameStore } from "../my-app/src/store";
import io from "socket.io-client";

// --- CONFIGURAÇÃO DE URLS ---

const DEFAULT_URL = "http://192.168.2.166:3000";

/**
 * Garante que a URL tenha o protocolo http://
 */
const formatUrl = (url) => {
  if (!url) return DEFAULT_URL;
  // Limpa espaços em branco que podem vir no link
  const cleanUrl = url.trim();
  return cleanUrl.startsWith("http") ? cleanUrl : `http://${cleanUrl}`;
};

// 1. Tenta pegar o parâmetro '?server=' da URL (Funciona no Navegador e no PWA instalado)
const params = new URLSearchParams(window.location.search);
const serverParam = params.get("server") || params.get("ip"); // Aceita os dois nomes
const INITIAL_URL = formatUrl(serverParam);

// --- INICIALIZAÇÃO DO SOCKET ---

console.log("🔌 Socket operando em modo PWA:");
console.log("   - Alvo atual:", INITIAL_URL);

// Criamos o socket. No PWA, se o link mudar, a página recarrega e esse código roda de novo com o novo IP.
export const socket = io(INITIAL_URL, {
  autoConnect: true,
  transports: ["websocket"], // Melhora a estabilidade em redes locais
});

// --- LISTENERS GLOBAIS ---

socket.on("connect", () => {
  console.log("🟢 Conectado ao servidor:", socket.io.uri);
});

socket.on("connect_error", (err) => {
  console.error("🔴 Erro de conexão:", err.message);
  console.log(
    "Dica: Verifique se o servidor local está ligado e no mesmo Wi-Fi."
  );
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

socket.on("historyIncrement", (item) => {
  useGameStore.getState().addHistoryItem(item);
});
