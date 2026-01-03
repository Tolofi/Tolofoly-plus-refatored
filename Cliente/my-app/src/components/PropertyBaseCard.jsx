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
      >
        {/* HEADER */}
        <div
          className="nu-header"
          style={{
            backgroundColor: mainColor,
            color: "white",
          }}
        >
          <div className="nu-tag-container"></div>
          <h2 className="nu-title">{propriedade.name}</h2>
        </div>

        {/* LISTA DE ALUGUÉIS */}
        <div className="nu-rent-list" style={{ position: "relative" }}>
          {propriedade.rent.map((valor, index) => {
            const isActive = propriedade.level === index;

            const isPadrao = !isSpecialType && index === 0;
            const isHotel = !isSpecialType && index === 5;
            const isHouse = !isSpecialType && !isPadrao && !isHotel;

            return (
              <div
                key={index}
                className="nu-rent-item"
                // Removemos o style condicional daqui para usar o motion.div abaixo
                style={{
                  position: "relative",   // Necessário para o absolute do fundo funcionar
                  zIndex: 1, // Contexto de empilhamento
                  backgroundColor: "transparent", // Fundo transparente, quem dá a cor é o motion.div
                }}
              >
                {/* --- FUNDO ANIMADO (MAGIC MOTION) --- */}
                {isActive && (
                  <motion.div
                    // CORREÇÃO AQUI: Adicionamos o ID da propriedade ao layoutId
                    layoutId={`active-rent-bg-${
                      propriedade.id || propriedade.name
                    }`}
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: activeBackground,
                      borderRadius: 8,
                      zIndex: -1,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }} // Sugestão: Spring fica mais natural que easeInOut
                  />
                )}

                {/* LADO ESQUERDO: Ícone + Texto */}
                {/* Envolvemos o conteúdo num span relativo para garantir z-index acima do fundo */}
                <span
                  className="label"
                  style={{
                    position: "relative",
                    zIndex: 2,
                    color: isActive ? textActiveColor : undefined,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {/* 1. Ícone Padrão */}
                  {isPadrao && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 21h18v-8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8z"></path>
                    </svg>
                  )}

                  {/* 2. Ícone Casas */}
                  {isHouse && (
                    <span
                      style={{
                        display: "flex",
                        gap: "3px",
                        alignItems: "center",
                      }}
                    >
                      {index}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                    </span>
                  )}

                  {/* 3. Ícone Hotel */}
                  {isHotel && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="4"
                        y="2"
                        width="16"
                        height="20"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="9" y1="2" x2="9" y2="22"></line>
                      <line x1="15" y1="2" x2="15" y2="22"></line>
                      <line x1="4" y1="12" x2="20" y2="12"></line>
                      <line x1="4" y1="7" x2="20" y2="7"></line>
                      <line x1="4" y1="17" x2="20" y2="17"></line>
                    </svg>
                  )}

                  {/* 4. Ícone Estação */}
                  {isEstacao && (
                    <span
                      style={{
                        display: "flex",
                        gap: "4px",
                        alignItems: "center",
                      }}
                    >
                      {index + 1}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="2" y="5" width="20" height="10" rx="2" />
                        <path d="M2 10h20" />
                        <path d="M7 15l-2 5" />
                        <path d="M17 15l2 5" />
                        <path d="M8 8a2 2 0 1 1-4 0" />
                        <path d="M16 8a2 2 0 1 1 4 0" />
                      </svg>
                    </span>
                  )}

                  {/* 5. Ícone Companhia */}
                  {isCompanhia && (
                    <span
                      style={{
                        display: "flex",
                        gap: "4px",
                        alignItems: "center",
                      }}
                    >
                      {index + 1}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                      </svg>
                    </span>
                  )}

                  {/* TEXTO DESCRITIVO */}
                  <span style={{ marginLeft: "6px" }}>
                    {isSpecialType
                      ? isEstacao
                        ? index === 0
                          ? "Estação"
                          : "Estações"
                        : index === 0
                        ? "Companhia"
                        : "Companhias"
                      : isPadrao
                      ? "Aluguel Base"
                      : isHotel
                      ? "Hotel"
                      : "Casas"}
                  </span>
                </span>

                {/* LADO DIREITO: Valor */}
                <span
                  className="value"
                  style={{
                    position: "relative",
                    zIndex: 2,
                    color: isActive ? textActiveColor : undefined,
                    fontWeight: isActive ? "700" : undefined,
                  }}
                >
                  R$ {valor.toLocaleString("pt-BR")}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    
  );
};
