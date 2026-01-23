import { motion } from "framer-motion";

export const BoardModal = ({ title, content }) => {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      style={{
        position: "fixed",
        bottom: 0, // <--- FALTAVA ISSO
        left: 0, // <--- E ISSO
        width: "100%", // <--- E ISSO
        padding: "30px",
        backgroundColor: "rgba(40, 40, 40, 0.95)", // Um pouco mais opaco
        boxShadow: "0 -4px 30px rgba(0, 0, 0, 0.5)", // Sombra para cima
        zIndex: 9999, // Z-index bem alto
        textAlign: "center",
        borderTop: "4px solid #ffd700", // Borda dourada bonita
        backdropFilter: "blur(5px)",
      }}
    >
      <h1
        style={{
          color: "#ffd700",
          margin: "0 0 10px 0",
          textTransform: "uppercase",
        }}
      >
        {title}
      </h1>
      <h2 style={{ color: "#fff", margin: 0, fontWeight: "normal" }}>
        {content}
      </h2>
    </motion.div>
  );
};
