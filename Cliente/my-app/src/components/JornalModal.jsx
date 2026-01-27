import React from "react";
import { motion } from "framer-motion";

export const JornalModal = ({ data, close }) => {
  if (!data) return null;

  // Data atual formatada para dar um toque de realismo
  const dataHoje = new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 9999,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        backdropFilter: "blur(5px)",
      }}
      onClick={close}
    >
      <motion.div
        initial={{ scale: 0.5, rotate: -15, y: 500, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, y: 0, opacity: 1 }}
        exit={{ scale: 0.5, y: 500, opacity: 0 }}
        transition={{ type: "spring", damping: 15, stiffness: 100 }}
        onClick={(e) => e.stopPropagation()} // Impede fechar ao clicar no papel
        style={{
          width: "100%",
          maxWidth: "450px",
          background: "#fdfbf7", // Cor de papel jornal envelhecido
          color: "#1a1a1a",
          padding: "25px",
          borderRadius: "2px", // Cantos pouco arredondados (papel)
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          textAlign: "center",
          fontFamily: "'Times New Roman', serif", // Fonte essencial para o look
          border: "1px solid #dcdcdc",
          position: "relative",
        }}
      >
        {/* === CABEÇALHO DO JORNAL === */}
        <div
          style={{
            borderBottom: "3px double #333",
            paddingBottom: "10px",
            marginBottom: "15px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "2.8rem",
              textTransform: "uppercase",
              letterSpacing: "-2px",
              fontWeight: "900",
              lineHeight: "0.9",
            }}
          >
            GAZETA DO JOGO
          </h1>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.75rem",
              marginTop: "8px",
              fontWeight: "bold",
              color: "#555",
              textTransform: "uppercase",
              borderTop: "1px solid #333",
              paddingTop: "4px",
            }}
          >
            <span>EDIÇÃO EXTRA</span>
            <span>{dataHoje}</span>
            <span>BARBACENA</span>
          </div>
        </div>

        {/* === MANCHETE === */}
        <h2
          style={{
            fontSize: "2.2rem",
            lineHeight: "1",
            margin: "0 0 15px 0",
            fontWeight: "900",
            textTransform: "uppercase",
            color: "#222",
          }}
        >
          {data.titulo}
        </h2>

        {/* Linha divisória fina */}
        <div
          style={{
            width: "100%",
            height: "1px",
            background: "#333",
            marginBottom: "15px",
          }}
        />

        {/* === CORPO DA NOTÍCIA === */}
        <div
          style={{
            fontSize: "1.2rem",
            lineHeight: "1.4",
            textAlign: "justify",
            color: "#333",
          }}
        >
          <p style={{ margin: 0 }}>
            {/* Letra Capitular (Drop Cap) */}
            <span
              style={{
                float: "left",
                fontSize: "3.5rem",
                lineHeight: "0.7",
                fontWeight: "bold",
                marginRight: "8px",
                marginTop: "2px",
                fontFamily: "serif",
              }}
            >
              {data.corpo.charAt(0)}
            </span>
            {data.corpo.slice(1)}
          </p>
        </div>

        {/* === RODAPÉ / AVATAR (Opcional) === */}
        {data.player && (
          <div
            style={{
              marginTop: "20px",
              paddingTop: "10px",
              borderTop: "1px dashed #aaa",
              fontSize: "0.9rem",
              fontStyle: "italic",
              color: "#666",
            }}
          >
            Protagonista desta edição: <strong>{data.player}</strong>
          </div>
        )}

        {/* Botão de Fechar 'X' Estilizado */}
        <button
          onClick={close}
          style={{
            position: "absolute",
            top: "-15px",
            right: "-15px",
            background: "#1a1a1a",
            color: "#fff",
            border: "2px solid #fff",
            width: "35px",
            height: "35px",
            borderRadius: "50%",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
          }}
        >
          ✕
        </button>
      </motion.div>
    </div>
  );
};
