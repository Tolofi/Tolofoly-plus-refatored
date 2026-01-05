import { motion } from "framer-motion";

export const PeaoAnimado = ({ id, cor }) => {
  return (
    <motion.div
      layout
      layoutId={`peao-${id}`}
      // Adicionamos o delay aqui (ex: 1.5 segundos para o dado girar)
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
      }}
      style={{
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        backgroundColor: cor,
        border: "2px solid white",
        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
        zIndex: 100,
      }}
    />
  );
};
