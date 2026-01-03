import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../css/paymentAnimation.css"; // Importando o CSS acima

// Ícones
const WifiIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
);
const BankIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
    <path d="M12 18V6" />
  </svg>
);

export const BankDepositAnimation = ({
  sourceName = "Banco",
  amount = 0,
  onComplete,
}) => {
  const [success, setSuccess] = useState(false);
  const [start, setStart] = useState(false);

  useEffect(() => {
    // Cronograma
    setTimeout(() => setStart(true), 400); // Inicia movimento
    setTimeout(() => setSuccess(true), 1300); // Sucesso (Verde)
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 3200);
  }, [onComplete]);

  const amountFmt = amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  // --- TRAJETÓRIA INVERTIDA (Direita -> Esquerda) ---
  const cardVariants = {
    hidden: {
      x: 450, // Começa na DIREITA
      y: 180,
      rotate: 45, // Inclinação invertida
      scale: 0.8,
      opacity: 0,
    },
    animate: {
      // Movimento: Direita -> Centro -> Esquerda
      x: [450, 60, 0, -60, -450],

      // Arco Vertical (sobe e plana no meio)
      y: [180, -60, -60, -60, 180],

      // Rotação: +45 -> 0 -> -45
      rotate: [45, 5, 0, -5, -45],

      scale: [0.8, 1.1, 1.1, 1.1, 0.8],
      opacity: [0, 1, 1, 1, 0],

      transition: {
        duration: 2.0,
        ease: "easeInOut",
        // Fica parado "lendo" entre 20% e 80% do tempo
        times: [0, 0.2, 0.5, 0.8, 1],
      },
    },
  };

  return (
    <div className="payment-overlay">
      <div className="scene-wrapper">
        {/* CARTÃO PRETO (Vindo da Direita) */}
        <motion.div
          className="payment-card bank-card" // <--- Classe do cartão preto
          variants={cardVariants}
          initial="hidden"
          animate={start ? "animate" : "hidden"}
        >
          <div className="bank-label">INFINITE BANK</div>
          <div style={{ alignSelf: "flex-start", marginTop: 10 }}>
            <BankIcon />
          </div>

          <div
            style={{
              width: 35,
              height: 22,
              borderRadius: 4,
              marginTop: "auto",
              background: "linear-gradient(135deg, #fceabb, #f8b500)", // Chip Dourado
              opacity: 0.9,
              boxShadow: "inset 0 1px 2px rgba(255,255,255,0.4)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 14,
              right: 14,
              fontSize: 10,
              color: "#ca8a04",
              fontFamily: "monospace",
            }}
          >
            **** 0001
          </div>
        </motion.div>

        {/* A MÁQUINA "FLOW" (Reutilizada) */}
        <motion.div
          className="machine-body"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
        >
          <div className="nfc-header">
            <div style={{ fontSize: 10, fontWeight: "bold" }}>RECEIVER</div>
            <WifiIcon />
          </div>

          <div className={`machine-screen ${success ? "success" : ""}`}>
            <AnimatePresence mode="wait">
              {!success ? (
                // --- ESTADO 1: PROCESSANDO ---
                <motion.div
                  key="wait"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="screen-content"
                >
                  {/* Valor Verde para indicar entrada */}
                  <span className="price-tag" style={{ color: "#059669" }}>
                    + {amountFmt}
                  </span>
                  <span className="instruct-text">Processando</span>
                </motion.div>
              ) : (
                // --- ESTADO 2: CREDITADO ---
                <motion.div
                  key="ok"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="screen-content"
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span
                    style={{
                      color: "white",
                      fontSize: 12,
                      fontWeight: "bold",
                      marginTop: 6,
                      textTransform: "uppercase",
                    }}
                  >
                    Creditado
                  </span>
                  <span
                    style={{
                      color: "white",
                      fontSize: 10,
                      opacity: 0.9,
                      marginTop: 2,
                    }}
                  >
                    {sourceName}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* TECLADO */}
          <div className="keypad-grid">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="key-btn" />
            ))}
            <div className="key-btn cancel" />
            <div className="key-btn clear" />
            <div className="key-btn action" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
