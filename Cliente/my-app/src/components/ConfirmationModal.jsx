import { motion } from "framer-motion";

export const ConfirmationModal = ({act, close}) => {
    return (
        <>
      {/* Overlay Escuro (Fundo) para focar no modal */}
      <motion.div
        className="magic-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close} // Fecha se clicar fora (opcional)
      />

      {/* O Modal (Card Branco) */}
      <motion.div
        className="magic-modal-container"
        initial={{ y: "-100vh", x: "-50%", opacity: 0 }}
        animate={{ y: "-50%", x: "-50%", opacity: 1 }}
        exit={{ y: "-100vh", x: "-50%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <h3 className="magic-modal-title">Você tem certeza?</h3>

        <button className="magic-modal-btn" onClick={() => act(true)}>
          Sim
        </button>
        <button className="magic-modal-btn" onClick={() => act(false)}>
          Não
        </button>
      </motion.div>
    </>
    )
}