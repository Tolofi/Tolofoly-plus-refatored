import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { socket } from "../../socket";
import { useNavigate, useLocation } from "react-router-dom";

// --- NOVO COMPONENTE: CRONÔMETRO DIGITAL ---
const AuctionTimer = ({ endTime }) => {
  const [timeLeftMs, setTimeLeftMs] = useState(0);
  const requestRef = useRef();

  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      const ms = endTime - Date.now();

      if (ms <= 0) {
        setTimeLeftMs(0);
        return;
      }

      setTimeLeftMs(ms);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [endTime]);

  // Formata para segundos com 1 casa decimal (ex: 9.5)
  const seconds = (timeLeftMs / 1000).toFixed(1);

  // Define a cor baseada no tempo
  const getTimerColor = () => {
    if (timeLeftMs > 5000) return "#4ade80"; // Verde
    if (timeLeftMs > 2000) return "#ffd700"; // Amarelo
    return "#ff4d4d"; // Vermelho
  };

  // Define se deve pulsar (urgência nos últimos 3s)
  const isUrgent = timeLeftMs > 0 && timeLeftMs < 3000;

  return (
    <div className="timer-container-digital">
      <div
        className={`timer-text ${isUrgent ? "pulse-anim" : ""}`}
        style={{ color: getTimerColor() }}
      >
        ⏱ {seconds}s
      </div>

      {/* Barra fina embaixo apenas para referência visual */}
      <div className="timer-bar-bg">
        <div
          className="timer-bar-fill"
          style={{
            width: `${Math.min((timeLeftMs / 10000) * 100, 100)}%`,
            backgroundColor: getTimerColor(),
          }}
        />
      </div>
    </div>
  );
};

// --- Componente Principal ---
export const Leilao = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const initialData = location.state || {};

  const [propriedade, setPropriedade] = useState(
    initialData.propriedade || null,
  );
  const [valorAtual, setValorAtual] = useState(
    initialData.propriedade ? initialData.propriedade.price || 0 : 0,
  );

  const [started, setStarted] = useState(false);
  const [totalBids, setTotalBids] = useState(0);
  const [vencendoUsername, setVencendoUsername] = useState("Ninguém");

  // Estado para guardar o tempo final calculado localmente
  const [endTime, setEndTime] = useState(0);

  useEffect(() => {
    function onLeilaoAnuncio(data) {
      setStarted(false);
      setPropriedade(data.propriedade);
      setValorAtual(data.propriedade.price || 0);
    }

    function onLeilaoIniciado(data) {
      setStarted(true);
      setEndTime(data.endTime);
    }

    function onLeilaoNovoLance(data) {
      setValorAtual(data.valorAtual);
      setTotalBids(data.totalBids);
      setVencendoUsername(data.username);
    }

    function onTempoEstendido(data) {
      // Atualiza o fim com o novo tempo
      setEndTime(Date.now() + data.novoTempoRestante);
    }

    function onBoardVencedor(data) {
      navigate("/main");
    }

    socket.on("leilaoAnuncio", onLeilaoAnuncio);
    socket.on("leilaoIniciado", onLeilaoIniciado);
    socket.on("leilaoNovoLance", onLeilaoNovoLance);
    socket.on("leilaoTempoEstendido", onTempoEstendido);
    socket.on("boardVencedor", onBoardVencedor);

    return () => {
      socket.off("leilaoAnuncio", onLeilaoAnuncio);
      socket.off("leilaoIniciado", onLeilaoIniciado);
      socket.off("leilaoNovoLance", onLeilaoNovoLance);
      socket.off("leilaoTempoEstendido", onTempoEstendido);
      socket.off("boardVencedor", onBoardVencedor);
    };
  }, [navigate]);

  if (!propriedade) {
    return (
      <div className="leilao-overlay">
        <div className="leilao-modal">
          <h2 className="leilao-title">Aguardando...</h2>
          <button className="leilao-btn" onClick={() => navigate("/main")}>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="leilao-overlay"
    >
      <style>{`
        /* CSS INLINE PARA O TIMER NOVO */
        .timer-container-digital {
          margin: 20px 0;
          text-align: center;
        }
        .timer-text {
          font-size: 3.5rem;
          font-weight: 900;
          font-family: monospace;
          text-shadow: 0 0 10px rgba(0,0,0,0.5);
          transition: color 0.3s;
        }
        .timer-bar-bg {
          width: 100%;
          height: 6px;
          background: #333;
          border-radius: 3px;
          margin-top: 5px;
          overflow: hidden;
        }
        .timer-bar-fill {
          height: 100%;
          transition: width 0.1s linear, background-color 0.3s;
        }
        /* Animação de pulsar (urgência) */
        @keyframes pulse-red {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        .pulse-anim {
          animation: pulse-red 0.5s infinite;
        }
      `}</style>

      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        className="leilao-modal"
      >
        <h2 className="leilao-title">🔨 Leilão</h2>

        {!started && (
          <div>
            <p style={{ color: "#ccc", marginBottom: "20px" }}>Preparando...</p>
            <div className="propriedade-card">
              <div className="propriedade-nome">{propriedade.name}</div>
              <div className="propriedade-preco">
                Lance Mínimo: R$ {propriedade.price}
              </div>
            </div>
          </div>
        )}

        {started && (
          <div>
            {/* O NOVO TIMER ENTRA AQUI EM CIMA PARA DESTAQUE */}
            <AuctionTimer endTime={endTime} />

            <div className="info-row">
              <div style={{ textAlign: "left" }}>
                <span className="info-label">Ganhando</span>
                <span className="info-value text-gold">
                  {vencendoUsername.length > 12
                    ? vencendoUsername.substring(0, 10) + "..."
                    : vencendoUsername}
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className="info-label">Valor</span>
                <span className="info-value text-green">R$ {valorAtual}</span>
              </div>
            </div>

            <div
              className="propriedade-card"
              style={{ padding: "10px", margin: "10px 0" }}
            >
              <strong>{propriedade.name}</strong>
            </div>

            <p
              className="timer-help-text"
              style={{ fontSize: "0.8rem", color: "#888" }}
            >
              Lances nos últimos 2s adicionam tempo extra!
            </p>

            <button
              className="leilao-btn"
              onClick={() => socket.emit("auctionDoBid")}
            >
              DAR LANCE (+R$ 200)
              <span className="btn-subtext">
                Vai para: R$ {valorAtual + 200}
              </span>
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
