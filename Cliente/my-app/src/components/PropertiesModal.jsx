import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store";
import { PropertyListItem } from "./PropertyListItem"; // Novo componente acima

export const PropertiesModal = ({ close, allPlayers, onSell }) => {
  const myName = useGameStore((state) => state.username);
  const isMyTurn = useGameStore((state) => state.isMyTurn);
  const rawProperties = useGameStore((state) => state.properties);

  const [selectedOwner, setSelectedOwner] = useState(myName);

  // 1. Transformar em Array
  const allProperties =
    rawProperties instanceof Map
      ? Array.from(rawProperties.values())
      : Array.isArray(rawProperties)
      ? rawProperties
      : [];

  // 2. Definir Ordem das Cores (Padrão Monopoly)
  const colorOrder = [
    "Marrom",
    "Azul Claro",
    "Rosa",
    "Laranja",
    "Vermelho",
    "Amarelo",
    "Verde",
    "Azul",
    "Estacao",
    "Companhia",
  ];

  // 3. Filtrar e Ordenar
  const sortedProperties = allProperties
    .filter((p) => p.ownerUsername === selectedOwner)
    .sort((a, b) => {
      const colorDiff =
        colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color);
      if (colorDiff !== 0) return colorDiff;
      return a.position - b.position; // Se for mesma cor, ordena pela posição
    });

  useEffect(() => {
    // Ao abrir: trava o scroll do fundo
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none"; // Bloqueia gestos no fundo

    return () => {
      // Ao fechar (cleanup): libera o scroll
      document.body.style.overflow = "unset";
      document.body.style.touchAction = "auto";
    };
  }, []);

  return (
    <>
      <motion.div
        className="magic-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
        style={{ zIndex: 100 }}
      />

      <motion.div
        className="magic-modal-container"
        initial={{ y: "100vh", x: "-50%" }}
        animate={{ y: "-30%", x: "-50%" }} // Ajustado para colar no bottom
        exit={{ y: "100vh", x: "-50%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          width: "100%",
          maxWidth: "500px",
          height: "80%",
          borderRadius: "24px 24px 0 0",
          display: "flex",
          flexDirection: "column",
          background: "#f3f4f6", // Cor de fundo levemente cinza
        }}
      >
        {/* CABEÇALHO FIXO */}
        <div
          style={{
            padding: "20px",
            background: "white",
            borderRadius: "24px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "15px",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: "800",
                color: "#111827",
              }}
            >
              Imóveis
            </h3>
            <button
              onClick={close}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                color: "#6b7280",
                padding: "0",
              }}
            >
              &times;
            </button>
          </div>

          {/* SELETOR DE JOGADORES (TABS) */}
          <div
            style={{
              display: "flex",
              overflowX: "auto",
              gap: "8px",
              paddingBottom: "5px",
            }}
          >
            {allPlayers.map((player) => (
              <button
                key={player}
                onClick={() => setSelectedOwner(player)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "12px",
                  border: "none",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                  backgroundColor:
                    selectedOwner === player ? "#2563eb" : "#e5e7eb",
                  color: selectedOwner === player ? "white" : "#4b5563",
                  transition: "all 0.2s",
                }}
              >
                {player === myName ? "Meus" : player}
              </button>
            ))}
          </div>
        </div>

        {/* LISTA SCROLLABLE */}
        <div style={{ flex: 1, overflowY: "auto", padding: "15px" }}>
          {sortedProperties.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                marginTop: "40px",
                color: "#9ca3af",
              }}
            >
              <p>Este jogador não possui imóveis.</p>
            </div>
          ) : (
            sortedProperties.map((prop) => (
              <PropertyListItem
                key={prop.id || prop.name}
                prop={prop}
                myName={myName}
                isMyTurn={isMyTurn}
                onSell={onSell}
              />
            ))
          )}
        </div>
      </motion.div>
    </>
  );
};
