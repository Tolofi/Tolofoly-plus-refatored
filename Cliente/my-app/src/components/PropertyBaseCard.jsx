import React from "react";
import { motion } from "framer-motion";

// IMPORTANTE: Importe os componentes que criamos anteriormente
import { Sky } from "./scenario/Sky"; // Ajuste o caminho conforme seu projeto

export const NuPropertyCard = ({ propriedade }) => {
  if (!propriedade || !propriedade.rent) return null;

  // --- 1. DEFINIÇÃO DE CORES ---
  const colors = {
    Marrom: ["#6B2E0E", "#F3E6DC"],
    "Azul Claro": ["#1E5AA8", "#E6F1FF"],
    Rosa: ["#9E2E58", "#FBE4EE"],
    Laranja: ["#B35A14", "#FFF1E3"],
    Vermelho: ["#A32020", "#FDEAEA"],
    Amarelo: ["#8A6A00", "#FFF7D6"],
    Verde: ["#1B6E3E", "#E6F6EE"],
    Azul: ["#1C4E9A", "#E5EFFF"],
    Estacao: ["#2D3436", "#F0F0F0"],
    Companhia: ["#636e72", "#dfe6e9"],
  };

  const nomeCor = propriedade.color;
  const [textActiveColor] = colors[nomeCor] || ["#333", "#eee"];
  const mainColor = propriedade.themeColor || textActiveColor;

  // --- CONFIGURAÇÃO NOITE/CLIMA ---
  // Defina variáveis para controlar o estado
  const hour = propriedade.hour; // "dia" ou "noite"
  const weather = propriedade.weather; // "clear" ou "rainy"

  // LÓGICA PRINCIPAL: O ambiente é "escuro" se for noite OU se estiver chovendo
  const isDarkContext = hour === "noite" || weather === "rainy";

  // Estilo do Glow: Sombra colorida suave + brilho aumentado
  const glowStyle = isDarkContext
    ? {
        textShadow: `0 0 4px ${mainColor}, 0 0 10px ${mainColor}`,
        filter: "brightness(1.1)", // Aumenta um pouco o brilho da cor base
      }
    : {};

  return (
    <motion.div
      key={propriedade.id || propriedade.name}
      className="nu-card"
      initial={{ x: "-100vh" }}
      animate={{ x: 0 }}
      exit={{ x: "100vh" }}
      transition={{ ease: "easeInOut", duration: 0.5 }}
      style={{
        overflow: "hidden",
        backgroundColor: "transparent",
        fontFamily: "Nunito, sans-serif",
        position: "relative",
        margin: "0 auto"
      }}
    >
      {/* === BACKGROUND: CÉU === */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      >
        {/* Passamos as variáveis hour e weather para o Sky reagir */}
        <Sky hour={hour} cloudsNumber={3} weather={weather} />
      </div>

      {/* HEADER */}
      <div
        className="nu-header"
        style={{
          color: "#fff",
          padding: "10px",
          textAlign: "center",
          zIndex: 1,
          position: "relative",
        }}
      >
        <h2
          className="nu-title"
          style={{
            margin: 0,
            color: mainColor,
            fontSize: "1.5rem",
            fontWeight: "bold",
            // Aplica o glow se for noite OU chuva
            ...glowStyle,
          }}
        >
          {propriedade.name}
        </h2>
      </div>

      {/* LISTA DE DETALHES */}
      <div
        className="nu-rent-list"
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          padding: "10px 0",
          // Fundo um pouco mais escuro se for contexto escuro (opcional, mantive comentado como no seu)
          // backgroundColor: isDarkContext
          //   ? "rgba(20, 20, 30, 0.85)"
          //   : "rgba(255, 255, 255, 0.9)",
          // backdropFilter: "blur(5px)",
          borderRadius: "8px 8px 0 0",
          margin: "0 10px",
          marginBottom: "10px",
          // border: isDarkContext ? `1px solid ${mainColor}44` : "none",
        }}
      >
        {/* Indicadores Visuais de Nível */}
        <div
          className="casas"
          style={{ display: "flex", gap: "4px", marginBottom: "10px" }}
        >
          {Array.from({ length: propriedade.color === "Estacao" || propriedade.color === "Companhia" ? propriedade.level + 1 || 0 : propriedade.level || 0 }).map((_, index) => (
            <svg
              key={index}
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill={mainColor}
              // Adicionei um filtro de drop-shadow nas casinhas também se for contexto escuro
              style={
                isDarkContext
                  ? { filter: `drop-shadow(0 0 2px ${mainColor})` }
                  : {}
              }
            >
              <path
                d="M4 20h16V10l-8-7-8 7z"
                stroke={mainColor}
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text
                x="12"
                y="15"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#fff"
                fontSize="10"
                fontWeight="bold"
                style={{ userSelect: "none" }}
              >
                {index + 1}
              </text>
            </svg>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-around",
            marginBottom: "10px",
          }}
        >
          {/* BLOCO ALUGUEL */}
          <div
            className="nu-property-owner"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "0.8rem",
                color: isDarkContext ? "#ccc" : "#666",
              }}
            >
              Aluguel Atual
            </span>
            <span
              style={{
                fontSize: "1.4rem",
                color: mainColor,
                fontWeight: "bold",
                ...glowStyle, // GLOW AQUI
              }}
            >
              R${" "}
              {propriedade.rent && propriedade.rent[propriedade.level || 0]
                ? propriedade.rent[propriedade.level || 0]
                : 0}
            </span>
          </div>

          {/* BLOCO PROPRIETÁRIO */}
          <div
            className="nu-property-owner"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "0.8rem",
                color: isDarkContext ? "#ccc" : "#666",
              }}
            >
              Proprietário
            </span>
            <span
              style={{
                fontSize: "1.2rem",
                color: isDarkContext ? "#fff" : "#333", // Texto branco no escuro
                fontWeight: "bold",
                textTransform: "uppercase",
                textShadow: isDarkContext
                  ? "0 0 5px rgba(255,255,255,0.5)"
                  : "none",
              }}
            >
              {propriedade.ownerUsername || "Banco"}
            </span>
          </div>
        </div>

        <div
          style={{
            width: "90%",
            paddingTop: "5px",
            // borderTop: isDarkContext ? "1px solid #444" : "1px solid #eee",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* BLOCO TOTAL */}
          <span
            style={{
              fontSize: "0.8rem",
              color: isDarkContext ? "#ccc" : "#666",
            }}
          >
            Total Arrecadado
          </span>
          <span
            style={{
              fontSize: "1.1rem",
              color: "#4CAF50",
              fontWeight: "bold",
              textShadow: isDarkContext ? "0 0 8px #4CAF50" : "none",
            }}
          >
            R$ {propriedade.acummulatedCapital || 0}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
