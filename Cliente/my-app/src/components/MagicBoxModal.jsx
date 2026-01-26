import { motion } from "framer-motion";

export const MagicBoxModal = ({ act, setQtd, val, isMove, close }) => {
  return (
    <>
      <motion.div
        className="magic-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close} // Fecha se clicar fora (opcional, sem argumentos)
      />

      <motion.div
        className="magic-modal-container"
        initial={{ y: "-100vh", x: "-50%", opacity: 0 }}
        animate={{ y: "-50%", x: "-50%", opacity: 1 }}
        exit={{ y: "-100vh", x: "-50%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <h3 className="magic-modal-title">Qual o valor?</h3>

        <input
          className="magic-modal-input"
          type="number"
          placeholder="Digite a quantidade..."
          autoFocus
          value={val === 0 ? "" : val}
          onChange={(e) => {
            const apenasNumeros = e.target.value.replace(/[^0-9]/g, "");
            setQtd(apenasNumeros);
          }}
        />

        {isMove && (
          <>
            {/* CORREÇÃO AQUI: Usar () => act(true) */}
            <button className="magic-modal-btn" onClick={() => act(true)}>
              Andar pra frente
            </button>
            {/* CORREÇÃO AQUI: Usar () => act(false) */}
            <button className="magic-modal-btn" onClick={() => act(false)}>
              Andar pra trás
            </button>
          </>
        )}
        {!isMove && (
          <button className="magic-modal-btn" onClick={() => act()}>
            Confirmar
          </button>
        )}
      </motion.div>
    </>
  );
};
