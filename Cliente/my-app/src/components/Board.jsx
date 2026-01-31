import React, { useState, useEffect } from "react";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";
import { BoardMachine } from "./PagamentoBoard";
import { socket } from "../../socket";

// --- HELPERS ---
const getCoords = (id) => {
  const numericId = Number(id);
  const shiftedId = (numericId + 5) % 40;

  if (shiftedId >= 0 && shiftedId <= 10) return { x: 11 - shiftedId, y: 11 };
  if (shiftedId >= 11 && shiftedId <= 20)
    return { x: 1, y: 11 - (shiftedId - 10) };
  if (shiftedId >= 21 && shiftedId <= 30)
    return { x: 1 + (shiftedId - 20), y: 1 };
  if (shiftedId >= 31 && shiftedId <= 39)
    return { x: 11, y: 1 + (shiftedId - 30) };
  return { x: 11, y: 11 };
};

const getTileSideClass = (x, y) => {
  if ((x === 1 || x === 11) && (y === 1 || y === 11)) return "tile-corner";
  if (y === 11) return "tile-bottom";
  if (x === 1) return "tile-left";
  if (y === 1) return "tile-top";
  if (x === 11) return "tile-right";
  return "";
};

const JUMP_DURATION = 280;

const GamePawn = ({ player, targetPos, playersOnSameSquare }) => {
  const [visualPos, setVisualPos] = useState(Number(player.posicao));
  const finalPos = Number(targetPos);

  useEffect(() => {
    if (visualPos === finalPos) return;
    const timer = setTimeout(() => {
      setVisualPos((prev) => (prev + 1) % 40);
    }, JUMP_DURATION);
    return () => clearTimeout(timer);
  }, [visualPos, finalPos]);

  const { x, y } = getCoords(visualPos);
  const myIndex = playersOnSameSquare.findIndex((p) => p.id === player.id);
  const total = playersOnSameSquare.length;

  const offsetX = total > 1 ? (myIndex - (total - 1) / 2) * 14 : 0;
  const offsetY = total > 1 ? (myIndex % 2 === 0 ? -10 : 10) : 0;

  return (
    <motion.div
      layout
      className="pawn"
      style={{
        backgroundColor: player.color,
        zIndex: 100 + myIndex,
        gridColumn: x,
        gridRow: y,
        border: "3px solid white",
        boxShadow: "0 4px 8px rgba(0,0,0,0.6)",
      }}
      animate={{ x: offsetX, y: offsetY, scale: [1, 1.25, 1] }}
      transition={{
        layout: { duration: 0.3, type: "spring", stiffness: 300, damping: 30 },
      }}
    />
  );
};

export const Board = ({ propriedadesServidor, jogadores }) => {
  const [isTvMode, setIsTvMode] = useState(true);
  const [machineActive, setMachineActive] = useState(false);
  const [currentTurnUser, setCurrentTurnUser] = useState(
    jogadores[0]?.username || "",
  );

  const [fontScale, setFontScale] = useState(1);

  // --- RESTAURADO: LÓGICA DA MAQUININHA ---
  useEffect(() => {
    function onMachineTransaction(data) {
      setMachineActive({
        status: true,
        valor: data.valor,
        destinatario: data.destinatario,
        remetente: data.remetente,
      });
    }

    socket.on("machineTransaction", onMachineTransaction);
    return () => socket.off("machineTransaction", onMachineTransaction);
  }, []);

  useEffect(() => {
    const handleTurnUpdate = (data) => {
      if (data && data.playerDaVez) setCurrentTurnUser(data.playerDaVez);
    };
    socket.on("turn_update", handleTurnUpdate);
    return () => socket.off("turn_update", handleTurnUpdate);
  }, []);

  const propsArray = Array.isArray(propriedadesServidor)
    ? propriedadesServidor
    : Object.values(propriedadesServidor || {});

  if (propsArray.length === 0) return <div>Sincronizando...</div>;

  return (
    <div className="game-container">
      <AnimatePresence mode="wait">
        {machineActive.status && (
          <BoardMachine
            valor={machineActive.valor}
            destinatario={machineActive.destinatario}
            remetente={machineActive.remetente}
            onFinish={() => {
              // Envia o recibo de volta para o servidor processar o pagamento
              socket.emit("receipt", {
                destinatario: machineActive.destinatario,
                valor: machineActive.valor,
                remetente: machineActive.remetente,
              });
              setMachineActive(false);
            }}
          />
        )}
      </AnimatePresence>

      <LayoutGroup>
        <motion.div
          className={`board-grid ${isTvMode ? "mode-tv" : "mode-tabletop"}`}
          layout
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* HUD CENTRAL */}
          <div className="board-center">
            <motion.div
              layout
              className="player-container"
              style={{ display: "flex", gap: "15px", justifyContent: "center" }}
            >
              {jogadores.map((p) => {
                const isTurn = p.username === currentTurnUser;
                return (
                  <motion.div
                    layout
                    key={p.id}
                    animate={{
                      scale: isTurn ? 1.1 : 0.9,
                      opacity: isTurn ? 1 : 0.6,
                      y: isTurn ? 5 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: "100px",
                      padding: "10px 15px",
                      borderRadius: "12px",
                      backgroundColor: isTurn
                        ? "rgba(255, 255, 255, 0.95)"
                        : "rgba(30, 41, 59, 0.6)",
                      border: isTurn
                        ? `3px solid ${p.color}`
                        : "1px solid rgba(255,255,255,0.1)",
                      boxShadow: isTurn
                        ? `0 0 15px ${p.color}, 0 4px 6px rgba(0,0,0,0.3)`
                        : "0 2px 4px rgba(0,0,0,0.2)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: p.color,
                        marginBottom: "6px",
                      }}
                    />
                    <div
                      className="player-name"
                      style={{
                        color: isTurn ? "#1f2937" : "#e5e7eb",
                        fontWeight: "800",
                        fontSize: "0.9rem",
                      }}
                    >
                      {p.nome || p.username}
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        color: isTurn ? "#059669" : "#9ca3af",
                      }}
                    >
                      {Number(p.money).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            <div
              className="hud-controls"
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "10px",
              }}
            >
              <div style={{ display: "flex", gap: "5px" }}>
                <button
                  onClick={() => setFontScale((s) => Math.max(0.5, s - 0.1))}
                  style={{
                    padding: "5px 10px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  A-
                </button>
                <button
                  onClick={() => setFontScale((s) => Math.min(2.5, s + 0.1))}
                  style={{
                    padding: "5px 10px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  A+
                </button>
              </div>

              <button onClick={() => setIsTvMode(!isTvMode)}>
                {!isTvMode ? "📺 Modo TV" : "🎲 Modo Mesa"}
              </button>
            </div>
          </div>

          {/* CASAS DO TABULEIRO */}
          {propsArray.map((prop) => {
            const { x, y } = getCoords(prop.id);
            const sideClass = getTileSideClass(x, y);
            const isCorner = (x === 1 || x === 11) && (y === 1 || y === 11);
            const corPropriedade = prop.themeColor || prop.color || "#ccc";

            const dono = jogadores.find((j) => {
              const lista = j.propertiesIds || j.propriedades || [];
              const arr = Array.isArray(lista) ? lista : Object.values(lista);
              return arr.some((p) => (p?.id || p) == prop.id);
            });

            let rotation = 0;
            if (!isTvMode) {
              if (sideClass === "tile-top") rotation = 180;
              if (sideClass === "tile-left") rotation = 90;
              if (sideClass === "tile-right") rotation = -90;
            }

            const stripStyle = {
              position: "absolute",
              backgroundColor: corPropriedade,
              zIndex: 5,
            };
            if (sideClass === "tile-bottom") {
              stripStyle.top = 0;
              stripStyle.width = "100%";
              stripStyle.height = "15%";
            }
            if (sideClass === "tile-top") {
              stripStyle.bottom = 0;
              stripStyle.width = "100%";
              stripStyle.height = "15%";
            }
            if (sideClass === "tile-left") {
              stripStyle.right = 0;
              stripStyle.width = "10%";
              stripStyle.height = "100%";
            }
            if (sideClass === "tile-right") {
              stripStyle.left = 0;
              stripStyle.width = "10%";
              stripStyle.height = "100%";
            }

            let alignItems = "center";
            let textAlign = "center";
            let textPadding = "2px";

            if (!isCorner && !prop.name?.toLowerCase().startsWith("via")) {
              if (sideClass === "tile-left") {
                alignItems = "flex-start";
                textAlign = "left";
                textPadding = "0 0 0 8px";
              } else if (sideClass === "tile-right") {
                alignItems = "flex-end";
                textAlign = "right";
                textPadding = "0 8px 0 0";
              }
            }

            let justifyContent = "center";
            if (sideClass === "tile-top") justifyContent = "flex-end";
            else if (sideClass === "tile-bottom") justifyContent = "flex-start";

            return (
              <div
                key={prop.id}
                style={{
                  gridColumn: x,
                  gridRow: y,
                  backgroundColor: dono ? dono.color : "white",
                  border: "1px solid #ddd",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {!isCorner && <div style={stripStyle} />}

                <motion.div
                  animate={{ rotate: rotation }}
                  style={{
                    zIndex: 6,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: justifyContent,
                    alignItems: alignItems,
                    paddingTop: sideClass === "tile-bottom" ? "15%" : "0",
                    paddingBottom: sideClass === "tile-top" ? "15%" : "0",
                    paddingLeft: sideClass === "tile-right" ? "20%" : "0",
                    paddingRight: sideClass === "tile-left" ? "20%" : "0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: justifyContent,
                      alignItems: alignItems,
                      textAlign: textAlign,
                      color: dono ? "white" : "#000",
                      textShadow: dono ? "2px 2px 4px rgba(0,0,0,0.5)" : "none",
                      width: "100%",
                      padding: textPadding,
                    }}
                  >
                    <div
                      style={{
                        fontSize: `${0.9 * fontScale}rem`,
                        fontWeight: "900",
                        textTransform: "uppercase",
                        lineHeight: "0.95",
                        wordBreak: "break-word",
                      }}
                    >
                      {prop.name}
                    </div>

                    {!dono && !isCorner && (prop.price || prop.valor) && (
                      <div
                        style={{
                          fontSize: `${0.8 * fontScale}rem`,
                          fontWeight: "700",
                          marginTop: "4px",
                          color: "#16a34a",
                        }}
                      >
                        R$ {prop.price || prop.valor}
                      </div>
                    )}

                    {prop.level > 0 && (
                      <div
                        style={{
                          fontSize: `${1.2 * fontScale}rem`,
                          color: dono ? "#fff" : "#f59e0b",
                        }}
                      >
                        {"★".repeat(prop.level)}
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })}

          {/* PEÕES */}
          {jogadores.map((player) => (
            <GamePawn
              key={player.id}
              player={player}
              targetPos={player.posicao}
              playersOnSameSquare={jogadores.filter(
                (p) => Number(p.posicao) === Number(player.posicao),
              )}
            />
          ))}
        </motion.div>
      </LayoutGroup>
    </div>
  );
};
