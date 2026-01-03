import { useState, useEffect } from "react";
import { motion, useAnimate } from "framer-motion"; // Certifique-se de que está instalado
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

  const typeWriter = async (text) => {
    setDisplayText("");
    for (let i = 0; i <= text.length; i++) {
      setDisplayText(text.slice(0, i));
      await new Promise((r) => setTimeout(r, 30));
    }
    await new Promise((r) => setTimeout(r, 400));
  };

  useEffect(() => {
    const runSequence = async () => {
      setShowSuccess(false);
      setDisplayText("");

      await new Promise((r) => setTimeout(r, 600));

      // 1. Lógica do Texto (Prefixo)
      let prefixo = "";
      if (isBank) {
        prefixo = ""; // Se for banco (Venda), não escreve nada antes
      } else {
        prefixo = type === "purchase" ? "Adquirindo:" : "Para:";
      }

      // Se tiver prefixo, adiciona espaço. Se não, mostra só o destinatário.
      const textoFinal = prefixo ? `${prefixo} ${destinatario}` : destinatario;

      await typeWriter(textoFinal);

      setDisplayText("");
      await new Promise((r) => setTimeout(r, 100));

      // 2. Digita Valor
      await typeWriter(`${valor}`);

      // 3. Animação do Cartão
      // LÓGICA DE DIREÇÃO:
      // Se for BANCO: Começa na direita (250) e vai pra esquerda (-300)
      // Se for NORMAL: Começa na esquerda (-250) e vai pra direita (300)
      const startX = isBank ? 250 : -250;
      const endX = isBank ? -300 : 300;

      await animate(
        ".card-visual",
        {
          x: [startX, endX],
          opacity: [0, 1, 1, 0],
          // Inverte a rotação se for banco para parecer natural vindo do outro lado
          rotate: isBank ? [0, -5, 5, 0] : [0, 5, -5, 0],
        },
        { duration: 1.0, ease: "easeInOut" }
      );

      // 4. Sucesso (Muda cor da tela)
      setDisplayText("");
      setShowSuccess(true);

      const successColor = type === "purchase" ? "#8b5cf6" : "#10b981";
      await animate(
        ".pos-screen",
        { backgroundColor: successColor, borderColor: successColor },
        { duration: 0.2 }
      );

      await new Promise((r) => setTimeout(r, 1200));

      if (onComplete) onComplete();
    };

    runSequence();
  }, [destinatario, valor, type, isBank, animate, onComplete]);

  return (
    // WRAPPER PARA CENTRALIZAR E FIXAR NA TELA
    <div className="transaction-overlay">
      <motion.div
        className="pos-container"
        ref={scope}
        initial={{ x: "-100vw", rotate: -45, opacity: 0 }}
        animate={{ x: 0, rotate: 0, opacity: 1 }}
        exit={{ x: "100vw", rotate: 45, opacity: 0 }}
        transition={{ type: "spring", stiffness: 70, damping: 14 }}
      >
        {/* CARTÃO */}
        <motion.div
          className={`card-visual ${isBank ? "bank-card" : ""}`}
          initial={{ x: isBank ? 250 : -250, opacity: 0 }}
        >
          <div className="card-chip"></div>

          {/* Lógica do Texto no Cartão */}
          {isBank ? (
            <div className="bank-label">Foly Bank</div> // <--- MUDANÇA AQUI
          ) : (
            <div className="card-logo"></div>
          )}
        </motion.div>

        {/* MÁQUINA */}
        <div className="minimal-machine">
          <div className="pos-screen">
            {!showSuccess ? (
              <>
                <span style={{ zIndex: 2 }}>{displayText}</span>
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
                  // Ícone de Check (Venda/Recebimento)
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
                  // Ícone de Venda/Sacola (Compra)
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
