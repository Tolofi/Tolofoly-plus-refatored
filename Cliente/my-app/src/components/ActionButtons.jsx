import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store";

export const ActionButtons = ({ actions, passTurn, onAction, isProperty }) => {
  const isMyTurn = useGameStore((state) => state.isMyTurn);

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      style={{ overflow: "hidden" }}
    >
      <div className="buttons-container">
        <AnimatePresence mode="popLayout">
          {actions.map((btn, index) => (
            <motion.button
              layout
              key={btn.label || index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => {
                if (onAction) onAction();
                btn.onClick(e);
              }}
              className={`btn btn-${btn.variant}`}
              disabled={btn.disabled}
            >
              {btn.label}
            </motion.button>
          ))}
          {(isMyTurn && !isProperty) && (
            <motion.button
              layout
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