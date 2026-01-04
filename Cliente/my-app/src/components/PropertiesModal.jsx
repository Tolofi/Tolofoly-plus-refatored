import { useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../store";
import { CurrentProperty } from "./X_CurrentProperty";
import { ActionButtons } from "./ActionButtons";
import { getAvailableActions } from "../buttonDecider";

export const PropertiesModal = ({ close, allPlayers, onSell }) => {
  const myName = useGameStore((state) => state.username);
  const isMyTurn = useGameStore((state) => state.isMyTurn);

  const rawProperties = useGameStore((state) => state.properties);
  const allProperties =
    rawProperties instanceof Map
      ? Array.from(rawProperties.values())
      : Array.isArray(rawProperties)
      ? rawProperties
      : [];

  const [selectedOwner, setSelectedOwner] = useState(myName);

  const filteredProperties = allProperties.filter(
    (p) => p.ownerUsername === selectedOwner
  );

  return (
    <>
      <motion.div
        className="magic-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
        // CAMADA 1: Fundo
        style={{ zIndex: 100 }}
      />

      <motion.div
        className="magic-modal-container"
        initial={{ y: "100vh", opacity: 0, x: "-50%" }}
        animate={{ y: "-30%", opacity: 1, x: "-50%" }}
        exit={{ y: "100vh", opacity: 0, x: "-50%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        // CAMADA 1: Conteúdo (position fixed é crucial aqui)
        style={{
          zIndex: 101,
          position: "fixed",
          bottom: 0,
          left: "50%", // Centraliza horizontalmente junto com o x: -50% do animate
          width: "100%",
          maxWidth: "500px",
          height: "85vh",
          borderRadius: "20px 20px 0 0",
          display: "flex",
          flexDirection: "column",
          background: "#f8f9fa",
        }}
      >
        {/* CABEÇALHO */}
        <div
          style={{
            padding: "20px 20px 10px 20px",
            background: "white",
            borderRadius: "20px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h3 className="magic-modal-title" style={{ margin: 0 }}>
              Portfólio
            </h3>
            <button
              onClick={close}
              style={{
                background: "none",
                border: "none",
                fontSize: "28px",
                cursor: "pointer",
                color: "#333",
              }}
            >
              &times;
            </button>
          </div>
          <div
            style={{
              display: "flex",
              overflowX: "auto",
              gap: "10px",
              paddingBottom: "10px",
              scrollbarWidth: "none",
            }}
          >
            {allPlayers.map((player, index) => {
              const isActive = selectedOwner === player;
              return (
                <button
                  key={index}
                  onClick={() => setSelectedOwner(player)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "20px",
                    border: "none",
                    fontWeight: "600",
                    fontSize: "14px",
                    backgroundColor: isActive ? "#2563eb" : "#e5e7eb",
                    color: isActive ? "white" : "#4b5563",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s",
                  }}
                >
                  {player === myName ? "Meus Imóveis" : player}
                </button>
              );
            })}
          </div>
        </div>

        {/* LISTA */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px"}} className="pml">
          {filteredProperties.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                marginTop: "50px",
                color: "#9ca3af",
              }}
            >
              <p>Nenhuma propriedade encontrada.</p>
            </div>
          ) : (
            filteredProperties.map((prop) => {
              let actions = [];

              if (selectedOwner === myName) {
                // Ações normais
                actions = getAvailableActions(prop, myName, isMyTurn);

                // Botão de Transferir
                actions.push({
                  label: "Transferir p/ Jogador",
                  variant: "secondary",
                  onClick: () => onSell(prop),
                });
              }

              return (
                <div
                  key={prop.id || prop.name}
                  style={{ marginBottom: "30px", position: "relative" }}
                >
                  <div style={{ pointerEvents: "none" }}>
                    <CurrentProperty propriedade={prop} />
                  </div>
                  {actions.length > 0 && (
                    <div style={{ marginTop: "10px", padding: "0 5px" }}>
                      <ActionButtons actions={actions} passTurn={null} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </>
  );
};
