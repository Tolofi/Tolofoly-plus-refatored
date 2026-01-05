import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NuPropertyCard } from "./PropertyBaseCard";
import { ActionButtons } from "./ActionButtons";
import { getAvailableActions } from "../buttonDecider";

export const PropertyListItem = ({ prop, myName, isMyTurn, onSell }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Mapeamento de cores para a borda lateral
  const colors = {
    Marrom: "#8B4513",
    "Azul Claro": "#94bdcaff",
    Rosa: "#FF69B4",
    Laranja: "#FFA500",
    Vermelho: "#FF0000",
    Amarelo: "#FFFF00",
    Verde: "#008000",
    Azul: "#1C4E9A",
    Estacao: "#a3abadff",
    Companhia: "#a3abadff",
  };

  const actions = getAvailableActions(prop, myName, isMyTurn);

  // Adiciona botão de transferência se eu for o dono
  if (prop.ownerUsername === myName) {
    actions.push({
      label: "Transferir",
      variant: "secondary",
      onClick: (e) => {
        // Importante: stopPropagation evita que o clique feche o acordeão
        e.stopPropagation();
        onSell(prop);
      },
    });
  }

  return (
    <div
      style={{
        marginBottom: "10px",
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "white",
        boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
        border: "1px solid #eee",
      }}
    >
      {/* CABEÇALHO DA LINHA (COMPACTO) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "14px 16px",
          cursor: "pointer",
          borderLeft: `10px solid ${colors[prop.color] || "#ccc"}`,
          transition: "background 0.2s",
        }}
        className="property-item-header"
      >
        <div style={{ flex: 1 }}>
          <span
            style={{ fontWeight: "700", color: "#1f2937", fontSize: "18px" }}
          >
            {prop.name}
          </span>
          {prop.mortgaged && (
            <span
              style={{
                marginLeft: "8px",
                fontSize: "10px",
                background: "#ef4444",
                color: "white",
                padding: "2px 6px",
                borderRadius: "4px",
                textTransform: "uppercase",
              }}
            >
              Hipotecado
            </span>
          )}
        </div>

        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          style={{ fontSize: "12px", color: "#9ca3af" }}
        >
          ▼
        </motion.span>
      </div>

      {/* ÁREA EXPANSÍVEL (CARTA + BOTÕES) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "circOut" }}
            style={{ overflow: "hidden", background: "#f9fafb" }}
          >
            <div style={{ padding: "15px", borderTop: "1px solid #f3f4f6" }}>
              {/* Card da Propriedade */}
              <NuPropertyCard propriedade={prop} />

              {/* Botões de Ação */}
              {actions.length > 0 && (
                <div style={{ marginTop: "15px" }}>
                  <ActionButtons
                    actions={actions}
                    passTurn={null}
                    isProperty={true}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
