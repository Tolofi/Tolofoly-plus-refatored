import React from "react";
import { motion } from "framer-motion";

export const DownBar = ({
  onTransferClick,
  onHistoryClick,
  onPropertiesClick,
}) => {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ease: "easeOut", duration: 0.4 }}
    >
      <div className="down-bar">
        <span
          className="down-bar-buttom"
          onClick={onTransferClick}
          style={{ cursor: "pointer" }}
        >
          Transferir
        </span>

        <span
          className="down-bar-buttom"
          onClick={onHistoryClick}
          style={{ cursor: "pointer" }}
        >
          Histórico
        </span>

        {/* --- ADICIONE O ONCLICK AQUI --- */}
        <span
          className="down-bar-buttom"
          onClick={onPropertiesClick} // <--- AQUI
          style={{ cursor: "pointer" }}
        >
          Propriedades
        </span>
      </div>
    </motion.div>
  );
};
