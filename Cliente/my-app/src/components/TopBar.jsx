import React from "react";
import { motion, AnimatePresence } from "framer-motion"; // <--- Importe AnimatePresence

export const TopBar = ({ dado, dinheiro, propriedade, notification }) => {
  const dinheiroFormatado = Number(dinheiro).toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
  });

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ease: "easeOut", duration: 0.4 }}
      className="dice-money-row"
      style={{ border: notification ? "3px solid #1f2937" : "none" }}
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
            style={{fontWeight: "600", fontSize: "16px"}}
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
              <span className="label">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill={propriedade.themeColor}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" />
                </svg>
              </span>
              <span className="value" style={{color:`${propriedade.themeColor}`}}>{propriedade.id === 0 ? "Início" : propriedade.id} -></span>
              <span className="value" style={{color:`#008000`}}>{(40 - propriedade.id) ? (40 - propriedade.id) : "?"}</span>
            </div>

            {/* 3. Dado */}
            <div className="status-item dice">
              <svg
                width="24"
                height="24"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
              >
                <rect
                  x="10"
                  y="10"
                  width="80"
                  height="80"
                  rx="15"
                  ry="15"
                  fill="#c6c9ceff"
                />
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
