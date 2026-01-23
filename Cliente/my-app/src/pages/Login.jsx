import { useState, useEffect } from "react";
import { ConnectionLabel } from "../components/ConnectionLabel";
import { socket } from "../../socket";
import { Alert } from "../components/Alert";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store";
import { QRCodeSVG } from "qrcode.react";

// 1. Importação do Scanner Nativo
import {
  BarcodeScanner,
  BarcodeFormat,
} from "@capacitor-mlkit/barcode-scanning";
import { currentVersion } from "../version";

export const Login = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const { username, setNome } = useGameStore();
  const [alertShow, setAlertShow] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const [ip, setIp] = useState(
    localStorage.getItem("socketIp") ? localStorage.getItem("socketIp") : "",
  );
  const [porta, setPorta] = useState(
    localStorage.getItem("socketPorta")
      ? localStorage.getItem("socketPorta")
      : "",
  );

  const [isIpSetting, setIsIpSetting] = useState(false);
  const [isIpShowing, setIsIpShowing] = useState(false);
  const navigate = useNavigate();
  const usernameStore = useGameStore((state) => state.username);

  // Dados que serão transformados em QR Code
  const qrData = JSON.stringify({
    ip: ip,
    porta: porta,
  });

  // 2. Lógica para ESCANEAR o QR Code
  const handleQrScan = async () => {
    try {
      // Pedir permissão de câmera
      const { camera } = await BarcodeScanner.requestPermissions();

      if (camera !== "granted") {
        setMensagem("Permissão de câmera negada.");
        setAlertShow(true);
        return;
      }

      // Iniciar leitura
      const { barcodes } = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode],
      });

      if (barcodes.length > 0) {
        const rawData = barcodes[0].displayValue;

        try {
          const config = JSON.parse(rawData);
          if (config.ip && config.porta) {
            // Salva os dados lidos
            localStorage.setItem("socketIp", config.ip);
            localStorage.setItem("socketPorta", config.porta);

            // Atualiza estados e recarrega para aplicar ao socket
            setIp(config.ip);
            setPorta(config.porta);
            setIsIpSetting(false);
            window.location.reload();
          }
        } catch (e) {
          setMensagem("QR Code inválido.");
          setAlertShow(true);
        }
      }
    } catch (error) {
      console.error("Erro no scanner: ", error);
    }
  };

  const enviarSolicitacaoNome = () => {
    if (username === "") {
      setMensagem("Campo de nome vazio.");
      setAlertShow(true);
      return;
    }
    socket.emit("registerPlayer", usernameStore);
  };

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }
    function onCheckVersion(version) {
      console.log("Versão atual: " + currentVersion + " | Versão do servidor: " + version)
      if(version !== currentVersion) navigate("/outdated");
      
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

    const init = async () => {
      try {
        await StatusBar.hide();
        await NavigationBar.hide({
          type: "immersiveSticky",
        });
      } catch (e) {
        console.warn("Erro inicial fullscreen", e);
      }
    };

    setTimeout(init, 1000);

    socket.on("checkVersion", onCheckVersion);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("registerSuccess", onRegisterSuccess);
    socket.on("registerFail", onRegisterFail);

    if (!socket.connected) {
      socket.connect();
    }
    return () => {
      socket.off("checkVersion", onCheckVersion);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("registerSuccess", onRegisterSuccess);
      socket.off("registerFail", onRegisterFail);
    };
  }, [navigate, username, setNome]);

  return (
    <>
      <button
        style={{
          position: "fixed",
          left: "50%",
          bottom: "1%",
          transform: "translateX(-50%)",
          backgroundColor: "#820ad1",
          borderRadius: "20px",
          color: "#fff",
        }}
        className="rgb"
        onClick={() => navigate("/board")}
      >
        Tabuleiro
      </button>

      <motion.div
        initial={false}
        animate={{ x: 0 }}
        exit={{ x: "-100vw", opacity: 0 }}
        transition={{ ease: "easeInOut", duration: 0.4 }}
        className="login-container rgb"
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

        <button className="btn-enter" onClick={enviarSolicitacaoNome}>
          Entrar no Jogo
        </button>

        <span style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
          <motion.button
            className="magic-btn"
            onClick={() => setIsIpSetting(true)}
            style={{
              height: "40px",
              backgroundColor: "transparent",
              border: "2px solid #820ad1",
              color: "#820ad1",
            }}
          >
            Colocar IP
          </motion.button>
          <motion.button
            className="magic-btn"
            onClick={() => setIsIpShowing(true)}
            style={{
              height: "40px",
              backgroundColor: "transparent",
              border: "2px solid #820ad1",
              color: "#820ad1",
            }}
          >
            Compartilhar IP
          </motion.button>
        </span>

        <div className="connection-row">
          <ConnectionLabel conectado={isConnected} />
        </div>
      </motion.div>

      <AnimatePresence>
        {/* MODAL PARA CONFIGURAR MANUALLY OU SCANNER */}
        {isIpSetting && (
          <>
            <motion.div
              key="overlay-setting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsIpSetting(false)}
              className="modal-overlay"
            />
            <motion.div
              key="modal-setting"
              className="ip-modal"
              initial={{ y: "100vh", x: "-50%" }}
              animate={{ y: "-50%", x: "-50%" }}
              exit={{ y: "100vh", x: "-50%" }}
              transition={{ ease: "easeInOut", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span
                className="input-text"
                style={{ color: "#1f2937", fontWeight: "700" }}
              >
                IP DA SALA
              </span>
              <input
                type="text"
                className="username-input"
                placeholder="IP..."
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                inputMode="decimal"
              />
              <span
                className="input-text"
                style={{ color: "#1f2937", fontWeight: "700" }}
              >
                PORTA
              </span>
              <input
                type="text"
                className="username-input"
                placeholder="PORTA..."
                value={porta}
                onChange={(e) => setPorta(e.target.value)}
                inputMode="decimal"
              />
              <button
                className="magic-btn"
                onClick={() => {
                  // 1. Salva no localStorage
                  localStorage.setItem("socketIp", ip);
                  localStorage.setItem("socketPorta", porta);

                  // 2. FORÇA O SOCKET A MUDAR O ENDEREÇO AGORA
                  // Isso garante que mesmo sem o reload terminar, o socket já sabe o destino
                  socket.io.uri = `http://${ip}:${porta}`;

                  // 3. TENTA CONECTAR IMEDIATAMENTE
                  if (!socket.connected) {
                    socket.connect();
                  }

                  setIsIpSetting(false);
                  // O reload agora é apenas um "refresco", a conexão já foi disparada
                  window.location.reload();
                }}
              >
                OK
              </button>

              <div
                style={{
                  width: "100%",
                  height: "1px",
                  background: "#ccc",
                  margin: "10px 0",
                }}
              />

              <button
                className="magic-btn"
                onClick={handleQrScan}
                style={{ backgroundColor: "#000" }}
              >
                ESCANEAR QR CODE
              </button>
            </motion.div>
          </>
        )}

        {/* MODAL PARA MOSTRAR QR CODE (COMPARTILHAR) */}
        {isIpShowing && (
          <>
            <motion.div
              key="overlay-showing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsIpShowing(false)}
              className="modal-overlay"
            />
            <motion.div
              key="modal-showing"
              className="ip-modal"
              initial={{ y: "100vh", x: "-50%" }}
              animate={{ y: "-50%", x: "-50%" }}
              exit={{ y: "100vh", x: "-50%" }}
              transition={{ ease: "easeInOut", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span
                className="input-text"
                style={{ color: "#1f2937", fontWeight: "700" }}
              >
                IP DA SALA:
              </span>
              <span
                className="input-text"
                style={{ color: "#1f2937", fontWeight: "600" }}
              >
                {ip || "Não definido"}
              </span>

              <span
                className="input-text"
                style={{ color: "#1f2937", fontWeight: "700" }}
              >
                PORTA:
              </span>
              <span
                className="input-text"
                style={{ color: "#1f2937", fontWeight: "600" }}
              >
                {porta || "Não definido"}
              </span>

              <div
                style={{
                  marginTop: "15px",
                  padding: "10px",
                  background: "#fff",
                  borderRadius: "10px",
                }}
              >
                <QRCodeSVG
                  value={qrData}
                  size={200}
                  level={"H"}
                  marginSize={4}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
