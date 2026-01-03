import { motion } from "framer-motion";
import { socket } from "../../socket";
import { useNavigate } from "react-router-dom";

export const MagicBox = ({ open, close }) => {
  const navigate = useNavigate();
  function emitRollDice() {
    socket.emit("rollDiceByPlayer");
  }
  return (
    <motion.div
      initial={{ y: "100%", x: "-50%", opacity: 0 }}
      animate={{ y: 0, x: "-50%", opacity: 1 }}
      exit={{ y: "100%", x: "-50%", opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="magic-box-container"
    >
      {/* Botão de Fechar (Alça no topo) */}
      <button className="magic-box-handle" onClick={close}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Grid de Ações */}
      <div className="magic-box-grid">
        <button className="magic-btn" onClick={() => open("move")}>
          Se mover
        </button>

        <button className="magic-btn" onClick={emitRollDice}>
          Girar dados
        </button>

        <button
          className="magic-btn full-width"
          onClick={() => open("getMoney")}
        >
          Pegar dinheiro com o banco
        </button>
        <button
          onClick={() => {
            localStorage.removeItem("monopoly_username");
            navigate("/");
          }}
          className="magic-btn"
          style={{
            background: "#ef4444",
            gridColumn: "span 2",
          }}
        >
          Voltar ao login
        </button>
      </div>
    </motion.div>
  );
};
