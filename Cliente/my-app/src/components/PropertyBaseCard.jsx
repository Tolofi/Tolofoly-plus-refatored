import React from "react";
import { AnimatePresence, motion } from "framer-motion";

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
  const [textActiveColor, activeBackground] = colors[nomeCor] || [
    "#333",
    "#eee",
  ];
  const mainColor = propriedade.themeColor || textActiveColor;

  const isEstacao = nomeCor === "Estacao";
  const isCompanhia = nomeCor === "Companhia";
  const isSpecialType = isEstacao || isCompanhia;

  return (
    <motion.div
      key={propriedade.id || propriedade.name}
      className="nu-card"
      initial={{ x: "-100vh" }}
      animate={{ x: 0 }}
      exit={{ x: "100vh" }}
      transition={{ ease: "easeInOut", duration: 0.5 }}
      style={{ border: `2px solid ${mainColor}` }}
    >
      {/* HEADER */}
      <div
        className="nu-header"
        style={{
          backgroundColor: mainColor,
          color: "#fff",
        }}
      >
        <div className="nu-tag-container"></div>
        <h2 className="nu-title" style={{ color: "#fff" }}>
          {propriedade.name}
        </h2>
      </div>

      {/* LISTA DE ALUGUÉIS */}
      <div
        className="nu-rent-list"
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          backgroundColor: "#fff",
        }}
      >
        <div className="casas">
          {/* Cria um array com o tamanho do 'level' e faz o map */}
          {Array.from({ length: propriedade.level || 0 }).map((_, index) => (
            <svg // Obrigatório no React ao usar map
              key={index}
              xmlns="http://www.w3.org/2000/svg"
              width="50"
              height="50"
              viewBox="0 0 24 24"
              fill={mainColor} // Adicionei o # que faltava no Hex
            >
              <path
                d="M4 20h16V10l-8-7-8 7z"
                stroke={mainColor}
                strokeWidth="1" // React usa camelCase
                strokeLinecap="round" // React usa camelCase
                strokeLinejoin="round" // React usa camelCase
                className={propriedade.level === 5 && "rgb"}
              />
              <text
                x="12" // Metade da largura do viewBox (24 / 2)
                y="14" // Metade da altura (12) + um ajuste visual leve para baixo
                textAnchor="middle" // Centraliza horizontalmente
                dominantBaseline="middle" // Centraliza verticalmente
                fill="#fff" // Cor do texto
                fontSize="10" // Tamanho da fonte
                fontWeight="bold" // Negrito
                style={{ userSelect: "none", fontFamily: "Nunito, sans-serif" }} // Impede que o usuário selecione o texto
              >
                {index + 1}
              </text>
            </svg>
          ))}
        </div>
        <div style={{display: "flex", width: "100%", justifyContent: "space-around"}}>
          <div className="nu-property-owner">
            <span style={{ fontSize: "0.9rem", fontWeight: 400 }}>Aluguel</span>
            <span style={{ fontSize: "1.8rem", color: mainColor }}>
              R$ {propriedade.rent[propriedade.level]}
            </span>
          </div>
          <div className="nu-property-owner">
            <span style={{ fontSize: "0.9rem", fontWeight: 400 }}>Dono</span>
            <span
              style={{
                fontSize: "1.8rem",
                color: mainColor,
                textTransform: "uppercase",
              }}
            >
              {propriedade.ownerUsername || "Banco"}
            </span>
          </div>
        </div>

        <div className="nu-property-owner">
          <span style={{ fontSize: "0.9rem", fontWeight: 400 }}>
            Arrecadação
          </span>
          <span style={{ fontSize: "1.8rem", color: mainColor }}>
            R$ {propriedade.acummulatedCapital}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
