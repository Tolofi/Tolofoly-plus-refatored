import { create } from "zustand";
import { socket } from "../socket";

export const useGameStore = create((set) => ({
  // 1. DADOS
  username: "",
  isConnected: false,
  isMyTurn: true,
  isDiceRolled: false,
  meAsObject: {},
  currentProperty: null,
  turnPhase: "WAITING",
  dice: 0,
  money: 0,
  history: [],

  // Adicionamos o Map aqui para guardar as propriedades
  properties: new Map(),
  players: [],

  // 2. AÇÕES
  setPlayers: (newPlayers) => set({ players: newPlayers }),
  setHistory: (newHistory) => set({ history: newHistory }),
  addHistoryItem: (item) =>
    set((state) => ({ history: [...state.history, item] })),
  setTurnPhase: (phase) => set({ turnPhase: phase }),
  setCurrentProperty: (prop) => set({ currentProperty: prop }),
  setNome: (novoNome) => set({ username: novoNome }),
  setConectado: (status) => set({ isConnected: status }),
  setIsMyTurn: (status) => set({ isMyTurn: status }),
  setDiceRolled: (status) => set({ isDiceRolled: status }),
  setDice: (number) => set({ dice: number }),
  setMeAsObject: (player) => set({ meAsObject: player }),

  // AÇÃO NOVA: Recebe o array, transforma em Map e salva
  updateProperties: (dataArray) => {
    // Criamos um Map novo para garantir que o Zustand dispare a re-renderização
    const mapTemporario = new Map();
    let autoId = 0;

    dataArray.forEach((item) => {
      const finalId =
        item.id !== undefined && item.id !== null ? item.id : autoId;
      mapTemporario.set(finalId, item);
      if (item.id === undefined || item.id === null) autoId++;
    });

    // Ao dar set em um novo Map, todos os componentes que usam 'state.properties' atualizam
    set({ properties: mapTemporario });
  },

  updatePlayersArray(data) {
    let arrayTemporario = data;
    set({ players: arrayTemporario });
  },

  updatePlayer: (dataObject) => {
    let playerTemporario = dataObject;

    // Salva o novo Map no estado
    set({ meAsObject: playerTemporario });
    set({ money: playerTemporario.saldo });
  },
}));
