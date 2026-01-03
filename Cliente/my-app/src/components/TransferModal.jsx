import { motion } from "framer-motion";

export const TransferModal = ({
  close,
  confirm,
  players = [], // Espera: ["Joao", "Maria", "Pedro"]
  selectedPlayer,
  setSelectedPlayer,
  amount,
  setAmount,
}) => {
  const isValid = selectedPlayer && amount > 0;

  return (
    <>
      <motion.div
        className="magic-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
      />

      <motion.div
        className="magic-modal-container"
        initial={{ y: "-100vh", x: "-50%", opacity: 0 }}
        animate={{ y: "-50%", x: "-50%", opacity: 1 }}
        exit={{ y: "-100vh", x: "-50%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <h3 className="magic-modal-title">Transferência</h3>

        <div style={{ width: "100%", textAlign: "left" }}>
          <label className="magic-label">Para quem?</label>
          <select
            className="magic-modal-input"
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
          >
            <option value="" disabled>
              Selecione...
            </option>
            {/* AJUSTE AQUI: Mapeia lista de strings direta */}
            {players.map((playerUsername, index) => (
              <option key={index} value={playerUsername}>
                {playerUsername}
              </option>
            ))}
          </select>
        </div>

        <div style={{ width: "100%", textAlign: "left" }}>
          <label className="magic-label">Valor (R$)</label>
          <input
            className="magic-modal-input"
            type="number"
            placeholder="0"
            value={amount === 0 ? "" : amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>

        <button
          className="magic-modal-btn"
          onClick={confirm}
          disabled={!isValid}
          style={{ opacity: isValid ? 1 : 0.5 }}
        >
          Enviar Dinheiro
        </button>
      </motion.div>
    </>
  );
};
