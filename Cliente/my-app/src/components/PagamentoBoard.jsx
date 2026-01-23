import { motion, transform } from "framer-motion";
import { useEffect, useState } from "react";

const styles = {
  container: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    zIndex: 9999,
  },
  // Reduzido de 300x500 para 240x400
  wrapper: { position: "relative", width: 240, height: 400 },

  maquina: {
    position: "relative",
    width: "100%",
    height: 350, // Reduzido de 400
    background: "#222",
    borderRadius: 24, // Bordas mais suaves para o tamanho menor
    zIndex: 20,
    display: "flex",
    flexDirection: "column",
    padding: 15, // Menos padding
    alignItems: "center",
    boxShadow: "0 15px 40px rgba(0,0,0,0.8)",
    marginTop: "auto",
  },

  visor: {
    width: "100%",
    height: 60, // Reduzido de 80
    background: "#111",
    borderRadius: 10,
    marginBottom: 15,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    // fontFamily: "monospace",
    fontSize: 18, // Fonte menor
    textAlign: "center",
    padding: 5,
    marginTop: 20,
    whiteSpace: "pre-line",
  },

  cartao: {
    position: "absolute",
    bottom: 0,
    left: "50%",
    x: "-50%",
    width: 140, // Reduzido de 140
    height: 220, // Reduzido de 220
    background: "linear-gradient(180deg, #1e85e0, #000428)",
    borderRadius: 10,
    zIndex: 15,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: 20,
    boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
  },

  recibo: {
    position: "absolute",
    top: 120, // Ajustado para a nova altura
    left: "50%",
    x: "-50%",
    width: 150, // Reduzido de 180
    background: "#fffce3",
    color: "#333",
    fontFamily: "monospace",
    fontSize: 12, // Fonte menor (recibo fiscal é pequeno mesmo)
    zIndex: 5,
    overflow: "hidden",
    boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
    padding: 8,
    borderTop: "1px dashed #ccc",
    textTransform: "UpperCase",
  },
};

export const BoardMachine = ({ valor, destinatario, remetente, onFinish }) => {
  const [fase, setFase] = useState("entrada");

  useEffect(() => {
    const sequence = async () => {
      await sleep(1400);
      setFase("inserindo");
      await sleep(1000);
      setFase("processando");
      await sleep(2000);
      setFase("imprimindo");
      await sleep(3000);
      setFase("entregando");
      await sleep(1000);
      setFase("saida");
      await sleep(800);
      if (onFinish) onFinish();
    };
    sequence();
  }, []);

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  return (
    <div style={styles.container}>
      <motion.div
        style={styles.wrapper}
        initial={{ x: "-100vw", opacity: 0, rotate: -45 }}
        animate={
          fase === "saida"
            ? { x: "100vw", opacity: 0, rotate: 45 }
            : { x: 0, opacity: 1, rotate: 0 }
        }
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      >
        <Recibo fase={fase} valor={valor} destinatario={destinatario} />
        <Cartao fase={fase} remetente={remetente} />

        <div style={styles.maquina}>

          <div style={styles.visor}>
            {fase === "entrada" && "AGUARDANDO..."}
            {fase === "inserindo" && "LENDO..."}
            {fase === "processando" && `${remetente} -> ${destinatario}\n R$ ${valor}`}
            {fase === "imprimindo" && "IMPRIMINDO..."}
            {(fase === "entregando" || fase === "saida") && "RETIRE ACIMA"}
          </div>

          <div
            className="minimal-keypad"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20, // Gap menor
              marginTop: 15,
            }}
          >
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: 35, // Botões menores (era 20)
                  height: 28,
                  background: "#626262",
                  borderRadius: 10, // Borda um pouco mais quadrada fica mais tech
                  // boxShadow: "0 2px 0 #222",
                }}
              />
            ))}
          </div>
          <div style={{fontSize: "20px", paddingBlockStart: "10px", fontWeight: 900}}>
            TOLOFI BANK
          </div>

        </div>
      </motion.div>
    </div>
  );
};

const Cartao = ({ fase, remetente }) => {
  const variants = {
    // ADICIONADO: opacity 0 para garantir que não dê para ver ele chegando
    hidden: { y: 500, opacity: 0 },

    inserted: {
      y: 0,
      opacity: 1, // Só aparece quando sobe
      transition: { type: "spring", stiffness: 100, damping: 20, duration: 0.2 },
    },

    drop: {
      y: 500,
      opacity: 1, // Mantém visível enquanto cai
      rotate: -10,
      transition: { duration: 0.4, ease: "easeIn" },
    },
  };

  const currentVariant =
    fase === "entregando" || fase === "saida"
      ? "drop"
      : fase === "entrada"
        ? "hidden"
        : "inserted";

  return (
    <motion.div
      style={styles.cartao}
      variants={variants}
      initial="hidden" // <--- A MÁGICA: Nasce já no estado 'hidden' (sem animar a ida)
      animate={currentVariant}
    >
      <div
        style={{
          width: 28,
          height: 36,
          background: "#e0c068",
          borderRadius: 5,
          marginBottom: 15,
          border: "1px solid #b89c50",
        }}
      />

      <div
        style={{
          color: "white",
          fontWeight: "bold",
          fontSize: 12,
          textAlign: "center",
          padding: "0 8px",
          lineHeight: 1.2,
        }}
      >
        {remetente}
      </div>

      <div
        style={{
          marginTop: "auto",
          marginBottom: 15,
          fontSize: 8,
          opacity: 0.7,
          letterSpacing: 1.5,
        }}
      >
        •••• 8092
      </div>
    </motion.div>
  );
};

const Recibo = ({ fase, destinatario, valor }) => {
  const variants = {
    hidden: { height: 0, opacity: 0, y: 0 },

    printing: {
      height: 180,
      opacity: 1,
      y: -280,
      transition: { duration: 2.5, ease: "linear" },
    },

    drop: {
      y: 1000,
      height: 180,
      opacity: 1,
      zIndex: 999,
      transition: { duration: 0.3, delay: 0.3, ease: "easeIn" },
    },
  };

  const currentVariant =
    fase === "entregando" || fase === "saida"
      ? "drop"
      : fase === "imprimindo"
        ? "printing"
        : "hidden";

  return (
    <motion.div
      style={styles.recibo}
      variants={variants}
      initial="hidden" // <--- A MÁGICA: Garante que nasce invisível
      animate={currentVariant}
    >
      <div
        style={{
          textAlign: "center",
          borderBottom: "1px dashed #999",
          paddingBottom: 4,
          marginBottom: 8,
        }}
      >
        <strong>VIA DO CLIENTE</strong>
      </div>
      <div style={{ lineHeight: 1.4, textAlign: "center" }}>
        <p style={{ marginBottom: 4 }}>TOLOFI BANK</p>
        <p>----------------</p>
        <p style={{ textAlign: "left" }}>PARA: {destinatario}</p>
        <p style={{ textAlign: "left", fontSize: 11 }}>
          VALOR: <strong>R$ {valor}</strong>
        </p>
        <p>----------------</p>
        <p style={{ fontSize: 9 }}>{new Date().toLocaleTimeString()}</p>
        <p style={{ fontSize: 9 }}>AUT: 882910</p>
      </div>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 3,
          background:
            "repeating-linear-gradient(45deg, transparent, transparent 2px, #fff 2px, #fff 4px)",
        }}
      />
    </motion.div>
  );
};
