import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store";

export const ActionButtons = ({ actions, passTurn, isProperty }) => {
  // Segurança: Se a lista estiver vazia ou nula, não renderiza nada
  const isMyTurn = useGameStore((state) => state.isMyTurn);

  return (
    <motion.div
      // 1. A Mágica: "layout" faz o container animar qualquer mudança de tamanho/posição
      layout
      // 2. Transição suave (Spring é ótimo para redimensionamento)
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      // 3. Importante: overflow hidden para o conteúdo não "vazar" enquanto o container encolhe
      style={{ overflow: "hidden" }}
    >
      <div className="buttons-container">
        <AnimatePresence mode="popLayout">
          {actions.map((btn, index) => (
            <motion.button
              // Adicione layout nos botões também para eles deslizarem suavemente
              layout
              key={btn.label || index} // Tente usar algo único como o label
              // Animação de entrada/saída dos botões individuais (opcional mas fica bonito)
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              onClick={btn.onClick}
              className={`btn btn-${btn.variant}`}
              disabled={btn.disabled}
            >
              {btn.label}
            </motion.button>
          ))}
          {(isMyTurn && !isProperty) && (
            <motion.button
              // Adicione layout nos botões também para eles deslizarem suavemente
              layout
              // Animação de entrada/saída dos botões individuais (opcional mas fica bonito)
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              onClick={passTurn}
              className={`pass-turn-btn`}
            >
              Terminar sua vez
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
