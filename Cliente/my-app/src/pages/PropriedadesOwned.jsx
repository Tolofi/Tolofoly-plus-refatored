import React from "react";
import { motion, AnimatePresence } from "framer-motion"; // <--- Importe AnimatePresence

export const TopBar = ({ dado, dinheiro, propriedades, notification }) => {
  const dinheiroFormatado = Number(dinheiro).toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
  });

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ease: "easeOut", duration: 0.4 }}
      className="dice-money-row"
    >
      <AnimatePresence mode="wait">
        {notification ? (
          // --- ESTADO A: NOTIFICAÇÃO ---
          <motion.div
            key="notify"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="topbar-notification" // <--- Classe CSS alinha tudo
          >
            {notification}
          </motion.div>
        ) : (
          // --- ESTADO B: STATUS ---
          <motion.div
            key="status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="topbar-status-wrapper" // <--- Classe CSS alinha tudo (space-between)
          >
            {/* 1. Dinheiro */}
            <div className="status-item money">
              <span className="label">R$</span>
              <span className="value">{dinheiroFormatado}</span>
            </div>

            {/* 2. Propriedades */}
            <div className="status-item properties">
              <span className="label">P:</span>
              <span className="value">{propriedades}</span>
            </div>

            {/* 3. Dado */}
            <div className="status-item dice">
              <svg width="24" height="24" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none">
                <rect x="10" y="10" width="80" height="80" rx="15" ry="15" fill="#e5e7eb" />
                <circle cx="30" cy="30" r="8" fill="#374151" />
                <circle cx="70" cy="30" r="8" fill="#374151" />
                <circle cx="30" cy="70" r="8" fill="#374151" />
                <circle cx="70" cy="70" r="8" fill="#374151" />
                <circle cx="50" cy="50" r="8" fill="#374151" />
              </svg>
              <span className="dice-value">{dado || 0}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

