import { Board } from "../components/Board";
import { useGameStore } from "../store";
import { socket } from "../../socket";
import { useEffect, useState } from "react";

export const AuxiliarScreen = () => {
  const [allPlayersList, setAllPlayersList] = useState([]);
  const [allPropertiesList, setAllPropertiesList] = useState([]);

  // 10 Cores vibrantes para identificar cada jogador
  const CORES_DISPONIVEIS = [
    "#FF0000",
    "#0000FF",
    "#008000",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#FFC0CB",
    "#A52A2A",
  ];

  useEffect(() => {
    // Solicita os dados iniciais do tabuleiro
    socket.emit("requestBoardData");

    // Recebe as propriedades do servidor
    socket.on("initProperties", (data) => {
      const propriedadesFormatadas = Object.values(data);
      setAllPropertiesList(propriedadesFormatadas);
    });

    // Recebe a atualização de todos os jogadores
    socket.on("allPLayerObject", (data) => {
      if (!data || typeof data !== "object") return;

      const listaBruta = Array.isArray(data) ? data : Object.values(data);

      const listaTratada = listaBruta.map((player, index) => ({
        ...player,
        // Garante ID e Cor para o Board e Framer Motion
        id: player.id || player.nome || player.username || `p-${index}`,
        color: CORES_DISPONIVEIS[index] || "#808080",
        // Normalização de dados para reatividade (Dinheiro e Patrimônio)
        money: player.money ?? player.saldo ?? 0,
        propertiesIds:
          player.propertiesIds ||
          player.properties ||
          player.propriedades ||
          [],
      }));

      // Força o React a identificar um novo array para atualizar a UI
      setAllPlayersList([...listaTratada]);
    });

    return () => {
      socket.off("initProperties");
      socket.off("allPLayerObject");
    };
  }, []);

  if (!allPropertiesList || allPropertiesList.length === 0) {
    return (
      <div
        style={{
          color: "white",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
        }}
      >
        Conectando ao servidor de jogo...
      </div>
    );
  }

  return (
    <div style={{ background: "#3b3b3bff", width: "100vw", height: "100vh" }}>
      <Board
        propriedadesServidor={allPropertiesList}
        jogadores={allPlayersList}
      />
    </div>
  );
};
