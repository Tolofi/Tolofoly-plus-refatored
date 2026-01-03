import { useState, useEffect } from "react";
import { ConnectionLabel } from "../components/ConnectionLabel";
// import { Alert } from "../components/Alert"; // Se for usar o alerta personalizado depois
import { socket } from "../../socket"; // Confirme se o caminho está certo
import { Alert } from "../components/Alert";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store";

export const Login = () => {
  // 1. Juntei os States num lugar só
  const [isConnected, setIsConnected] = useState(socket.connected);
  const { username, setNome } = useGameStore();
  const [alertShow, setAlertShow] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();
  const usernameStore = useGameStore((state) => state.username);

  // 2. Arrumei a função de enviar
  const enviarSolicitacaoNome = () => {
    if (username === "") {
      setMensagem("Campo de nome vazio.");
      setAlertShow(true); // Coloquei um alerta simples por enquanto
      return;
    }
    console.log(username);
    socket.emit("registerPlayer", usernameStore);
    // Aqui viria sua lógica de navegação ou socket.emit...
  };

  // 3. O useEffect estava correto, mantive igual
  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onRegisterSuccess() {
      navigate("/wait");
      console.log(`Logado como: ${username}!`);
    }

    function onRegisterFail(message) {
      console.log(message);
      setNome("");
    }

    
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("registerSuccess", onRegisterSuccess);
    socket.on("registerFail", onRegisterFail);

    socket.on("propertiesUpdate", (data) => {
      console.log(data);
    });
    socket.on("playerUpdate", (data) => {
      console.log(`player: ${JSON.stringify(data, null, 2)}`);
      console.log(data.propriedades);
    });

    if (!socket.connected) {
      socket.connect();
    }
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("propertiesUpdate");
      socket.off("playerUpdate");
    };
  }, []);

  return (
    <motion.div
      // 1. O TRUQUE: 'false' desliga a animação de entrada
      initial={false}
      // 2. O ESTADO FINAL: Onde ela deve ficar parada (visível e no centro)
      // (Mesmo com initial false, precisamos definir isso para o 'exit' saber de onde partir)
      animate={{ x: 0 }}
      // 3. O SAÍDA: Quando sair, vai para a esquerda (ou direita, você escolhe)
      exit={{ x: "-100vw", opacity: 0 }}
      transition={{ ease: "easeInOut", duration: 0.4 }}
      className="login-container"
    >
      <AnimatePresence>
        {alertShow && (
          <Alert mensagem={mensagem} fechamento={() => setAlertShow(false)} />
        )}
      </AnimatePresence>
      <div className="title-area">
        <span className="login-game-title">Tolofoly</span>
        <span className="login-game-description">
          Banco Imobiliário Digital
        </span>
      </div>

      <div className="input-group">
        <span className="username-input-label">SEU NOME</span>
        <input
          type="text"
          placeholder="Claudete Morel..."
          className="username-input"
          value={username}
          onChange={(e) => setNome(e.target.value)}
        />
      </div>

      {/* 4. Conectei a função no botão aqui: */}
      <button className="btn-enter" onClick={enviarSolicitacaoNome}>
        Entrar no Jogo
      </button>

      <div className="connection-row">
        <ConnectionLabel conectado={isConnected} />
      </div>
    </motion.div>
  );
}; // <--- Este colchete fecha o componente Login. Antes tinha dois aqui.
