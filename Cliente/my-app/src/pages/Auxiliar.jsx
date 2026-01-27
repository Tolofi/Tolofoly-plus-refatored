import { Board } from "../components/Board";
import { socket } from "../../socket";
import { useEffect, useState } from "react";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import { Fullscreen } from "@boengli/capacitor-fullscreen";
import { BoardModal } from "../components/BoardModal";
import { AnimatePresence } from "framer-motion";
// IMPORTAR O JORNAL
import { JornalModal } from "../components/JornalModal"; 

export const AuxiliarScreen = () => {
  const [allPlayersList, setAllPlayersList] = useState([]);
  const [allPropertiesList, setAllPropertiesList] = useState([]);

  // Estado do Modal Genérico
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [showModal, setShowModal] = useState(false);

  // NOVO: Estado do Jornal
  const [jornalData, setJornalData] = useState(null);

  const CORES_DISPONIVEIS = [
    "#FF0000", "#0000FF", "#008000", "#ffd000", "#FF00FF",
    "#00FFFF", "#FFA500", "#800080", "#FFC0CB", "#A52A2A",
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
    // ... (código existente de orientação de tela) ...
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

    socket.emit("requestBoardData");

    // ... (listeners existentes: initProperties, propertiesUpdate, allPLayerObject, etc) ...
    socket.on("initProperties", (data) => {
      const propriedadesFormatadas = Object.values(data);
      setAllPropertiesList(propriedadesFormatadas);
    });

    socket.on("propertiesUpdate", (data) => {
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
                propertiesIds: player.propertiesIds || player.properties || player.propriedades || [],
            }));
            setAllPlayersList([...listaTratada]);
        }, 5000);
    });

    socket.on("boardVencedor", (data) => {
       // ... lógica existente ...
       if (typeof data === "string") {
        mostrarModal("LEILÃO FINALIZADO", data);
      } else {
        mostrarModal(
          data.title || "AVISO",
          data.content || data.mensagem || "Algo aconteceu",
        );
      }
    });

    socket.on("leilaoAprovado", (data) => {
       // ... lógica existente ...
       if (typeof data === "string") {
        mostrarModal("LEILÃO APROVADO", data);
      } else {
        mostrarModal(
          data.title || "AVISO",
          data.content || data.mensagem || "Algo aconteceu",
        );
      }
    });

    // --- NOVO LISTENER DO JORNAL ---
    socket.on("showNewspaper", (data) => {
      console.log("Recebendo jornal:", data);
      setJornalData(data);
      
      // Opcional: Fechar automaticamente após 10 segundos se ninguém fechar
      setTimeout(() => {
          setJornalData(null);
      }, 15000); // 15 segundos para ler
    });

    return () => {
      // ... (offs existentes) ...
      socket.off("initProperties");
      socket.off("propertiesUpdate");
      socket.off("allPLayerObject");
      socket.off("boardVencedor");
      socket.off("leilaoAprovado");
      socket.off("showNewspaper"); // <--- Desligar aqui
      ScreenOrientation.lock({ orientation: "portrait" });
      Fullscreen.exitImmersiveMode();
    };
  }, []);

  // ... (verificação de loading existente) ...
  if (!allPropertiesList || allPropertiesList.length === 0) {
      // ... código de loading ...
      return <div>Carregando...</div>; 
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
        
        {/* --- RENDERIZA O JORNAL AQUI --- */}
        {jornalData && (
            <JornalModal 
                key="modal-jornal"
                data={jornalData}
                close={() => setJornalData(null)}
            />
        )}
      </AnimatePresence>
    </div>
  );
};