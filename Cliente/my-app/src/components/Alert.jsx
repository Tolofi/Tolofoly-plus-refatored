import { motion } from "framer-motion";

export const Alert = ({ mensagem, fechamento }) => {
  return (
    <motion.div
      // 1. INITIAL: Começa invisível e 200px PARA CIMA (negativo)
      initial={{ y: "-100vh" }}
      // 2. ANIMATE: Vai para a posição original (0) e fica visível
      animate={{ y: 0 }}
      exit={{ y: "-100vh" }}
      // 3. (Opcional) TRANSITION: Dá aquele efeito de "mola" ao cair
      transition={{ ease: "easeInOut", duration: 0.6 }}
      className="alert" // ou a classe do seu card
    >
      <div className="alert-container">
        <span className="alert-title">Alerta! </span>
        {mensagem}
        <button onClick={fechamento} className="close-alert-button">
          Ok
        </button>
      </div>
    </motion.div>
  );
};
