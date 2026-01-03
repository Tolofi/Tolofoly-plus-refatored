import { useState } from "react";
import { motion } from "framer-motion";
import { socket } from "../../socket";

export const SellPropertyModal = ({
  close,
  property,
  allPlayers,
  myUsername,
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState("");

  const targetPlayers = allPlayers.filter((p) => p !== myUsername);

  const handleConfirm = () => {
    if (!selectedPlayer) return alert("Selecione um jogador!");

    socket.emit("transferPropertyToPlayer", {
      propertyId: property.id,
      targetUsername: selectedPlayer,
    });

    close();
  };

  return (
    <>
      {/* Overlay Escuro - CAMADA 2 */}
      <motion.div
        className="magic-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
        style={{ zIndex: 200 }}
      />

      {/* Container do Modal - CAMADA 2 (Frente) */}
      <motion.div
        className="magic-modal-container"
        initial={{ y: "100%", opacity: 0, x: "-50%" }}
        animate={{ y: "-50%", opacity: 1, x: "-50%", top: "50%" }}
        exit={{ y: "100%", opacity: 0, x: "-50%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        style={{
          position: "fixed",
          left: "50%", // Centraliza
          top: "50%", // Centraliza
          width: "90%",
          maxWidth: "350px",
          background: "white",
          borderRadius: "20px",
          padding: "20px",
          zIndex: 201, // Maior que PropertiesModal (101) e overlay (200)
          height: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
        }}
      >
        <h3 style={{ margin: 0, textAlign: "center", color: "#1f2937" }}>
          Transferir Escritura
        </h3>

        <div
          style={{ textAlign: "center", fontSize: "14px", color: "#6b7280" }}
        >
          Propriedade: <strong>{property?.name}</strong>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <label
            style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}
          >
            Selecione o novo dono:
          </label>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {targetPlayers.map((player) => (
              <button
                key={player}
                // O clique deve funcionar agora por causa do z-index 201
                onClick={() => setSelectedPlayer(player)}
                style={{
                  flex: "1 1 auto",
                  padding: "10px",
                  borderRadius: "10px",
                  border:
                    selectedPlayer === player
                      ? "2px solid #2563eb"
                      : "1px solid #e5e7eb",
                  background: selectedPlayer === player ? "#eff6ff" : "white",
                  color: selectedPlayer === player ? "#2563eb" : "#4b5563",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {player}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button
            onClick={close}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "12px",
              border: "none",
              background: "#f3f4f6",
              color: "#4b5563",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedPlayer}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "12px",
              border: "none",
              background: selectedPlayer ? "#2563eb" : "#93c5fd",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            Confirmar
          </button>
        </div>
      </motion.div>
    </>
  );
};
