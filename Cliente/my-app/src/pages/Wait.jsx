import { React, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../store";
import { useNavigate } from "react-router-dom";
import { socket } from "../../socket";

export const Wait = () => {
  const username = useGameStore((state) => state.username);
  const [prepareState, setPrepareState] = useState(false);
  const navigate = useNavigate();
  const prepare = () => {
    setPrepareState(!prepareState);
    socket.emit("readyForInit");
    console.log("ready Enviado");
    // enviar socket
  };
  useEffect(() => {
    function onGameStarted() {
      console.log("GameStarted Recebido!");
      navigate("/main");
    }
    socket.on("gameAlreadyRunning", () => {
      navigate("/main"); // ou fechar modal de ready
    });
    socket.on("gameStarted", onGameStarted);
    socket.on("propertiesUpdate", (data) => {
      console.log(data);
    });
    socket.on("playerUpdate", (data) => {
      console.log(`player: ${data}`);
    });
    return () => {
      socket.off("onGameStarted");
      socket.off("propertiesUpdate");
      socket.off("playerUpdate");
    };
  }, []);

  return (
    <motion.div
      // 1. O TRUQUE: 'false' desliga a animação de entrada
      initial={{ x: "100vw" }}
      // 2. O ESTADO FINAL: Onde ela deve ficar parada (visível e no centro)
      // (Mesmo com initial false, precisamos definir isso para o 'exit' saber de onde partir)
      animate={{ x: 0 }}
      // 3. O SAÍDA: Quando sair, vai para a esquerda (ou direita, você escolhe)
      exit={{ x: "-100vw", opacity: 0 }}
      transition={{ ease: "easeInOut", duration: 0.4 }}
      className="wait-container"
    >
      <motion.div
        className="profileCircle"
        // AGORA SÓ PRECISAMOS DE DOIS ESTADOS: "Normal" e "Cheio"
        animate={{
          // Vai do tamanho normal (1) até 10% maior (1.1)
          scale: [1, 1.1],

          // Vai sem brilho até brilho forte
          boxShadow: [
            "0 0 0 rgba(130, 10, 209, 0)", // Estado 1: Normal
            "0 0 25px rgba(130, 10, 209, 0.6)", // Estado 2: Cheio (Aumentei um pouco pra ficar mais bonito)
          ],
        }}
        transition={{
          duration: 1.5, // Tempo para ir (1.5s para inspirar)
          repeat: Infinity, // Repete para sempre

          // A MÁGICA ESTÁ AQUI:
          repeatType: "reverse", // Faz o caminho de volta suavemente (expirar)

          ease: "easeInOut", // Movimento suave de "senoide"
        }}
      >
        {username.substring(0, 1).toUpperCase()}
      </motion.div>
      <span className="wait-label">
        Tudo pronto. Aguardando início do jogo.
      </span>
      <button
        className={`prepareStateButton ${
          prepareState ? "preparando" : "pronto"
        }`}
        onClick={prepare}
      >
        {prepareState ? "CANCELAR" : "FICAR PRONTO"}
      </button>
    </motion.div>
  );
};
