import { useState, useEffect } from "react";
import { motion, useAnimate } from "framer-motion";
import "../css/transactionMachine.css";

export const TransactionMachine = ({
  destinatario,
  valor,
  type = "transfer",
  isBank = false,
  onComplete,
}) => {
  const [displayText, setDisplayText] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [scope, animate] = useAnimate();

  useEffect(() => {
    // 1. Variável de controle para cancelar animações se o componente desmontar
    let isMounted = true;

    const typeWriter = async (text) => {
      if (!isMounted) return;

      setDisplayText("");

      for (let i = 0; i <= text.length; i++) {
        if (!isMounted) return; // Checagem a cada letra
        setDisplayText(text.slice(0, i));
        await new Promise((r) => setTimeout(r, 30));
      }

      if (!isMounted) return;
      await new Promise((r) => setTimeout(r, 400));
    };

    const runSequence = async () => {
      setShowSuccess(false);
      setDisplayText("");

      await new Promise((r) => setTimeout(r, 600));
      if (!isMounted) return;

      // --- 1. Escreve Destinatário ---
      let prefixo = "";
      if (isBank) {
        prefixo = "";
      } else {
        prefixo = type === "purchase" ? "Adquirindo:" : "Para:";
      }
      const textoFinal = prefixo ? `${prefixo} ${destinatario}` : destinatario;

      await typeWriter(textoFinal);
      if (!isMounted) return;

      setDisplayText("");
      await new Promise((r) => setTimeout(r, 100));
      if (!isMounted) return;

      // --- 2. Escreve Valor ---
      await typeWriter(`${valor}`);
      if (!isMounted) return;

      // --- 3. Animação do Cartão ---
      const startX = isBank ? 250 : -250;
      const endX = isBank ? -300 : 300;

      await animate(
        ".card-visual",
        {
          x: [startX, endX],
          opacity: [0, 1, 1, 0],
          rotate: isBank ? [0, -5, 5, 0] : [0, 5, -5, 0],
        },
        { duration: 1.0, ease: "easeInOut" }
      );

      if (!isMounted) return;

      // --- 4. Tela de Sucesso ---
      setDisplayText("");
      setShowSuccess(true);

      const successColor = type === "purchase" ? "#8b5cf6" : "#10b981";

      animate(
        ".pos-screen",
        { backgroundColor: successColor, borderColor: successColor },
        { duration: 0.2 }
      );

      await new Promise((r) => setTimeout(r, 1200));

      if (!isMounted) return;
      if (onComplete) onComplete();
    };

    runSequence();

    // Cleanup: Mata o processo se o componente sair da tela antes de acabar
    return () => {
      isMounted = false;
    };
  }, [destinatario, valor, type, isBank, animate, onComplete]);

  return (
    <div className="transaction-overlay">
      <motion.div
        className="pos-container"
        ref={scope}
        // Entra pela Esquerda
        initial={{ x: "-100vw", rotate: -45, opacity: 0 }}
        // Fica no Centro
        animate={{ x: 0, rotate: 0, opacity: 1 }}
        // Sai pela Direita
        exit={{ x: "100vw", rotate: 45, opacity: 0 }}

        // CONFIGURAÇÃO DE TRANSIÇÃO MISTA
        transition={{
          // Padrão (Movimento): Mola elástica
          type: "spring",
          stiffness: 70,
          damping: 14,

          // Específico (Opacidade): Suave e linear para não piscar
          opacity: {
            type: "tween",
            ease: "easeInOut",
            duration: 0.5,
          },
        }}
      >
        {/* CARTÃO */}
        <motion.div
          className={`card-visual ${isBank ? "bank-card" : ""}`}
          initial={{ x: isBank ? 250 : -250, opacity: 0 }}
        >
          <div className="card-chip"></div>
          {isBank ? (
            <div className="bank-label">Foly Bank</div>
          ) : (
            <div className="card-logo"></div>
          )}
        </motion.div>

        {/* MÁQUINA */}
        <div className="minimal-machine">
          <div className="pos-screen">
            {!showSuccess ? (
              <>
                {/* Fonte Monospace para evitar trepidação */}
                <span style={{ zIndex: 2, fontFamily: "monospace", fontWeight: "bold" }}>
                  {displayText}
                </span>
                <span className="screen-cursor">|</span>
              </>
            ) : (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  color: "white",
                }}
              >
                {type === "transfer" ? (
                  // Ícone de Check
                  <svg
                    width="50"
                    height="50"
                    viewBox="0 0 50 50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 26L22 33L35 18" />
                  </svg>
                ) : (
                  // Ícone de Venda/Sacola
                  <div style={{ textAlign: "center" }}>
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                    </svg>
                    <div
                      style={{
                        fontSize: "10px",
                        fontWeight: "bold",
                        marginTop: "5px",
                      }}
                    >
                      VENDIDO
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          <div className="minimal-keypad">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="dot-key"></div>
            ))}
            <div className="dot-key cancel"></div>
            <div className="dot-key"></div>
            <div className="dot-key enter"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};