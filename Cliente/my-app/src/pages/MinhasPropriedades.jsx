import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store";
import { PropertyListItem } from "../components/PropertyListItem";
import { useNavigate } from "react-router-dom";
import { SellPropertyModal } from "../components/SellPropertyModal";
import { socket } from "../../socket";

export const MinhasPropriedades = () => {
  const navigate = useNavigate();

  // Pegando dados do Store
  const username =
    useGameStore((state) => state.username) ||
    useGameStore((state) => state.meAsObject?.username) ||
    localStorage.getItem("monopoly_username");

  const isMyTurn = useGameStore((state) => state.isMyTurn);
  const rawProperties = useGameStore((state) => state.properties);
  const saldo = useGameStore((state) => state.meAsObject?.saldo || 0);
  const allPlayersList = useGameStore((state) => state.players || []);

  // Estados para o Modal de Venda/Transferência
  const [selectedPropForAction, setSelectedPropForAction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Transformação das propriedades
  const allProperties =
    rawProperties instanceof Map
      ? Array.from(rawProperties.values())
      : Array.isArray(rawProperties)
        ? rawProperties
        : [];

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

  const sortedProperties = allProperties
    .filter((p) => p.ownerUsername === username || p.dono === username)
    .sort((a, b) => {
      const colorDiff =
        colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color);
      if (colorDiff !== 0) return colorDiff;
      return a.position - b.position;
    });

  useEffect(() => {
    const handlePropertiesUpdate = (todasPropriedades) => {
      const store = useGameStore.getState();
      if (store.updateProperties) {
        store.updateProperties(todasPropriedades);
      }
      const idDaPropAtual = store.currentProperty?.id;
      if (idDaPropAtual !== undefined) {
        const propAtualizada = todasPropriedades.find(
          (p) => p.id === idDaPropAtual,
        );
        if (propAtualizada) {
          store.setCurrentProperty(propAtualizada);
        }
      }
      setIsProcessing(false);
    };

    socket.on("propertiesUpdate", handlePropertiesUpdate);

    // Cleanup ao desmontar
    return () => {
      socket.off("propertiesUpdate", handlePropertiesUpdate);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <motion.div
      className="page-container"
      initial={{ x: "100vw" }}
      animate={{ x: 0 }}
      exit={{ x: "-100vw", opacity: 0 }}
      transition={{ ease: "easeInOut", duration: 0.4 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        background: "#f3f4f6",
      }}
    >
      <AnimatePresence>
        {selectedPropForAction && (
          <SellPropertyModal
            close={() => setSelectedPropForAction(null)}
            property={selectedPropForAction}
            allPlayers={allPlayersList}
            myUsername={username}
          />
        )}
      </AnimatePresence>

      <div
        style={{
          padding: "20px",
          background: "white",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          gap: "15px",
        }}
      >
        <button
          onClick={() => navigate("/main")}
          style={{
            background: "none",
            color: "#374151",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
            padding: "5px", // Adicionado padding para facilitar o clique
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* SVG ATUALIZADO */}
          X
        </button>
        <h2 style={{ margin: 0, fontSize: "20px", color: "#111827" }}>
          Minhas Propriedades
        </h2>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "15px",
          opacity: isProcessing ? 0.8 : 1,
          pointerEvents: isProcessing ? "none" : "auto",
        }}
      >
        {sortedProperties.length === 0 ? (
          <div
            style={{ textAlign: "center", marginTop: "50px", color: "#9ca3af" }}
          >
            <div style={{ fontSize: "48px" }}>🏠</div>
            <p>Você ainda não possui imóveis.</p>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              paddingBottom: "40px",
            }}
          >
            {sortedProperties.map((prop) => (
              <PropertyListItem
                key={prop.id} // Mantém o estado da aba (aberto/fechado)
                prop={prop}
                myName={username}
                isMyTurn={isMyTurn}
                updateTrigger={saldo + prop.level} // Força a atualização dos botões internos
                onAction={() => {
                  setIsProcessing(true);
                  console.log("Ação disparada na propriedade:", prop.name);
                }}
                onSell={(p) => setSelectedPropForAction(p)}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
