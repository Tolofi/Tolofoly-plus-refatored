import { Board } from "../components/Board";
import { socket } from "../../socket";
import { useEffect, useState } from "react";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import { Fullscreen } from "@boengli/capacitor-fullscreen";
import { BoardModal } from "../components/BoardModal";
import { AnimatePresence } from "framer-motion";

export const AuxiliarScreen = () => {
  const [allPlayersList, setAllPlayersList] = useState([]);
  const [allPropertiesList, setAllPropertiesList] = useState([]);

  // Estado do Modal
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [showModal, setShowModal] = useState(false);

  const CORES_DISPONIVEIS = [
    "#FF0000",
    "#0000FF",
    "#008000",
    "#cece00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#FFC0CB",
    "#A52A2A",
  ];

  function mostrarModal(title, content) {
    setModalTitle(title);
    setModalContent(content);
    setShowModal(true);

    setTimeout(() => {
      setShowModal(false);
    }, 5000);
  }

  useEffect(() => {
    const entrarNoModoJogo = async () => {
      try {
        await ScreenOrientation.lock({ orientation: "landscape" });
        setTimeout(async () => {
          await Fullscreen.activateImmersiveMode();
        }, 500);
      } catch (e) {
        console.error("Erro ao entrar em modo jogo", e);
      }
    };

    entrarNoModoJogo();

    // Pede os dados iniciais
    socket.emit("requestBoardData");

    // 1. Recebe dados INICIAIS
    socket.on("initProperties", (data) => {
      const propriedadesFormatadas = Object.values(data);
      setAllPropertiesList(propriedadesFormatadas);
      console.log(propriedadesFormatadas);
    });

    // 2. 🔥 CORREÇÃO: Recebe ATUALIZAÇÕES (Compras, Trocas, Vendas)
    socket.on("propertiesUpdate", (data) => {
      // O backend manda um array direto em propertiesUpdate, ou um objeto.
      // O Memory.getAllPropertiesByArray() retorna Array, então:
      setTimeout(() => {
        const lista = Array.isArray(data) ? data : Object.values(data);
        setAllPropertiesList([...lista]);
      }, 5000);
    });

    socket.on("allPLayerObject", (data) => {
      setTimeout(() => {
        if (!data || typeof data !== "object") return;
        const listaBruta = Array.isArray(data) ? data : Object.values(data);

        const listaTratada = listaBruta.map((player, index) => ({
          ...player,
          id: player.id || player.nome || player.username || `p-${index}`,
          color: CORES_DISPONIVEIS[index] || "#808080",
          money: player.money ?? player.saldo ?? 0,
          propertiesIds:
            player.propertiesIds ||
            player.properties ||
            player.propriedades ||
            [],
        }));

        setAllPlayersList([...listaTratada]);
      }, 5000);
      console.log(listaTratada);
    });

    socket.on("boardVencedor", (data) => {
      if (typeof data === "string") {
        mostrarModal("LEILÃO FINALIZADO", data);
      } else {
        mostrarModal(
          data.title || "AVISO",
          data.content || data.mensagem || "Algo aconteceu",
        );
      }
    });

    return () => {
      socket.off("initProperties");
      socket.off("propertiesUpdate"); // <--- Não esqueça de desligar aqui também
      socket.off("allPLayerObject");
      socket.off("boardVencedor");
      ScreenOrientation.lock({ orientation: "portrait" });
      Fullscreen.exitImmersiveMode();
    };
  }, []);

  if (!allPropertiesList || allPropertiesList.length === 0) {
    return (
      <div
        style={{
          color: "white",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000",
        }}
      >
        <span style={{ fontSize: "20px", color: "#820ad1", fontWeight: 800 }}>
          Aguarde um instante!
        </span>
        <span style={{ fontSize: "20px", color: "#9ca3af", fontWeight: 400 }}>
          Sincronizando tabuleiro...
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#3b3b3bff",
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Board
        propriedadesServidor={allPropertiesList}
        jogadores={allPlayersList}
      />

      <AnimatePresence>
        {showModal && (
          <BoardModal
            key="modal-vencedor"
            title={modalTitle}
            content={modalContent}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
