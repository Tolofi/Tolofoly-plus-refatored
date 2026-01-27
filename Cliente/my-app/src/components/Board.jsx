import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BoardMachine } from "./PagamentoBoard";
import { socket } from "../../socket";
import { Sky } from "../components/scenario/Sky";

// --- HELPERS ---
const getNormalizedIndex = (index) => {
  return (index + 40) % 40;
};

// --- CONFIGURAÇÃO DE CORES ---
const PROPERTY_COLORS = {
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
  Sorte: ["#A855F7", "#F3E8FF"],
  Prisao: ["#374151", "#F9FAFB"],
  Padrao: ["#4B5563", "#F3F4F6"],
};

// --- NOVO CARD INTEGRADO (MANTIDO INTACTO) ---
const PropertyCard = ({ prop, positionStatus, playersHere }) => {
  const nomeCor = prop.color || "Padrao";
  const [textActiveColor] =
    PROPERTY_COLORS[nomeCor] || PROPERTY_COLORS["Padrao"];
  const mainColor = prop.themeColor || textActiveColor;

  const hour = prop.hour || "dia";
  const weather = prop.weather || "clear";
  const isDarkContext = hour === "noite" || weather === "rainy";

  const solidBgTypes = ["Comeco", "Sorte", "Visitante", "Prisao", "Taxa"];
  const isSolidBg = solidBgTypes.includes(prop.color);
  const isEstacionamento = prop.color === "Estacionamento";
  const isSimpleLayout = isSolidBg || isEstacionamento;

  const glowStyle = isDarkContext
    ? {
        textShadow: `0 0 4px ${mainColor}, 0 0 10px ${mainColor}`,
        filter: "brightness(1.2)",
      }
    : {};

  const variants = {
    prev: {
      x: "-115%",
      scale: 0.85,
      opacity: 0.7,
      rotateY: 25,
      zIndex: 1,
      filter: "brightness(0.7)",
    },
    current: {
      x: "0%",
      scale: 1,
      opacity: 1,
      rotateY: 0,
      zIndex: 10,
      filter: "none",
    },
    next: {
      x: "115%",
      scale: 0.85,
      opacity: 0.7,
      rotateY: -25,
      zIndex: 1,
      filter: "brightness(0.7)",
    },
    hiddenRight: { x: "200%", opacity: 0, scale: 0.8 },
  };

  const nivel = prop.level || 0;
  const aluguelAtual = prop.rent && prop.rent[nivel] ? prop.rent[nivel] : 0;
  const isSpecial = !prop.rent;

  return (
    <motion.div
      className="carousel-card"
      initial="hiddenRight"
      animate={positionStatus}
      variants={variants}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      style={{
        width: "360px",
        height: "550px",
        background: isSolidBg ? mainColor : "transparent",
        border: `2px solid ${isDarkContext ? "#ffffff33" : "#00000011"}`,
        transformStyle: "preserve-3d",
        borderRadius: "18px",
      }}
    >
      {!isSolidBg && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            borderRadius: "18px",
            overflow: "hidden",
          }}
        >
          <Sky hour={hour} cloudsNumber={3} weather={weather} />
        </div>
      )}

      <div
        className="card-content-wrapper"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "15px",
        }}
      >
        {isSimpleLayout ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: isSolidBg ? "#FFF" : mainColor,
                fontSize: "2.0rem",
                fontWeight: "900",
                lineHeight: 1.1,
                textTransform: "uppercase",
                ...(isSolidBg
                  ? { textShadow: "0 2px 10px rgba(0,0,0,0.3)" }
                  : glowStyle),
              }}
            >
              {prop.name}
            </h2>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: "15px" }}>
              <div
                style={{
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  color: "#fff",
                  opacity: 0.8,
                  backgroundColor: "rgba(0,0,0,0.3)",
                  borderRadius: "10px",
                  padding: "4px 10px",
                  display: "inline-block",
                  marginBottom: "8px",
                }}
              >
                {prop.id}
              </div>
              <h2
                style={{
                  margin: 0,
                  color: mainColor,
                  fontSize: "1.8rem",
                  fontWeight: "900",
                  lineHeight: 1.1,
                  textTransform: "uppercase",
                  ...glowStyle,
                }}
              >
                {prop.name}
              </h2>
            </div>

            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "12px",
                padding: "10px",
              }}
            >
              {!isSpecial ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      gap: "4px",
                      marginBottom: "20px",
                      height: "32px",
                      alignItems: "flex-end",
                    }}
                  >
                    {Array.from({
                      length: nivel
                    }).map((_, i) => (
                      <svg
                        key={i}
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill={mainColor}
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
                          strokeLinejoin="round"
                        />
                      </svg>
                    ))}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      marginBottom: "20px",
                      width: "100%",
                    }}
                  >
                    {prop.ownerUsername ? (
                      <>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "#666",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            fontWeight: "600",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            marginBottom: "4px",
                          }}
                        >
                          ALUGUEL
                        </span>
                        <span
                          style={{
                            fontSize: "2.5rem",
                            color: mainColor,
                            fontWeight: "bold",
                            ...glowStyle,
                            padding: "0 10px",
                            borderRadius: "8px",
                          }}
                        >
                          R$ {aluguelAtual}
                        </span>
                      </>
                    ) : (
                      <>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "#666",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            fontWeight: "600",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            marginBottom: "4px",
                          }}
                        >
                          PREÇO
                        </span>
                        <span
                          style={{
                            fontSize: "2.5rem",
                            color: "#4CAF50",
                            fontWeight: "bold",
                            padding: "0 10px",
                            borderRadius: "8px",
                            textShadow: isDarkContext
                              ? "0 0 8px #4CAF50"
                              : "none",
                          }}
                        >
                          R$ {prop.price}
                        </span>
                      </>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                      paddingTop: "15px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "#888",
                          fontWeight: "bold",
                        }}
                      >
                        PROPRIETÁRIO
                      </span>
                      <span
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: "bold",
                          color: isDarkContext ? "#fff" : "#333",
                          maxWidth: "110px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          textShadow: isDarkContext
                            ? "0 0 5px rgba(255,255,255,0.5)"
                            : "none",
                        }}
                      >
                        {prop.ownerUsername || "Banco"}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "#888",
                          fontWeight: "bold",
                        }}
                      >
                        ARRECADAÇÃO
                      </span>
                      <span
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: "bold",
                          color: "#4CAF50",
                          textShadow: isDarkContext
                            ? "0 0 8px #4CAF50"
                            : "none",
                        }}
                      >
                        R$ {prop.acummulatedCapital || 0}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    textAlign: "center",
                    color: "#666",
                  }}
                >
                  <p style={{ fontStyle: "italic", fontSize: "1.4rem" }}>
                    Evento Especial
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        <div
          className="pawns-container"
          style={{
            marginTop: "15px",
            height: "40px",
            display: "flex",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <AnimatePresence>
            {playersHere.map((p) => (
              <motion.div
                key={p.username}
                className="pawn-dot"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: p.color,
                  border: "3px solid white",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.6)",
                }}
                title={p.username}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

// --- BOARD PRINCIPAL ---
export const Board = ({ propriedadesServidor, jogadores }) => {
  const [machineActive, setMachineActive] = useState(false);
  const myUsername = localStorage.getItem("monopoly_username");

  const [currentTurnUser, setCurrentTurnUser] = useState(
    jogadores[0]?.username || "",
  );

  useEffect(() => {
    const handleTurnUpdate = (data) => {
      if (data && data.playerDaVez) {
        setCurrentTurnUser(data.playerDaVez);
      }
    };
    socket.on("turn_update", handleTurnUpdate);
    return () => {
      socket.off("turn_update", handleTurnUpdate);
    };
  }, []);

  const playerToFollow =
    jogadores.find((p) => p.username === currentTurnUser) || jogadores[0];

  const realTargetPos = playerToFollow ? Number(playerToFollow.posicao) : 0;

  const [visualPos, setVisualPos] = useState(realTargetPos);
  const previousPlayerRef = useRef(playerToFollow?.username);

  useEffect(() => {
    const currentPlayerName = playerToFollow?.username;

    if (currentPlayerName !== previousPlayerRef.current) {
      setVisualPos(realTargetPos);
      previousPlayerRef.current = currentPlayerName;
      return;
    }

    if (visualPos === realTargetPos) return;

    const SPEED_MS = 250;
    const timer = setTimeout(() => {
      setVisualPos((prev) => (prev + 1) % 40);
    }, SPEED_MS);

    return () => clearTimeout(timer);
  }, [visualPos, realTargetPos, playerToFollow]);

  const propsArray = useMemo(() => {
    const arr = Array.isArray(propriedadesServidor)
      ? propriedadesServidor
      : Object.values(propriedadesServidor || {});
    return arr.sort((a, b) => a.id - b.id);
  }, [propriedadesServidor]);

  const getPropById = (id) =>
    propsArray.find((p) => p.id === id) || { id, name: "...", color: "Padrao" };

  const centerIndex = visualPos;
  const prevIndex = getNormalizedIndex(centerIndex - 1);
  const nextIndex = getNormalizedIndex(centerIndex + 1);

  const currentProp = getPropById(centerIndex);
  const prevProp = getPropById(prevIndex);
  const nextProp = getPropById(nextIndex);

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

  if (propsArray.length === 0)
    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          background: "#020617",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Sincronizando...
      </div>
    );

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <AnimatePresence mode="wait">
        {machineActive.status && (
          <BoardMachine
            valor={machineActive.valor}
            destinatario={machineActive.destinatario}
            remetente={machineActive.remetente}
            onFinish={() => {
              setMachineActive(false);
              socket.emit("receipt", { ...machineActive });
            }}
          />
        )}
      </AnimatePresence>

      {/* --- HUD SUPERIOR (COM DINHEIRO FORMATADO) --- */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          paddingTop: "25px",
          display: "flex",
          justifyContent: "center",
          zIndex: 50,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)",
          paddingBottom: "50px",
          pointerEvents: "none",
        }}
      >
        <div
          className="player-container"
          style={{ display: "flex", gap: "15px", pointerEvents: "auto" }}
        >
          {jogadores.map((p) => {
            const isTurn = p.username === currentTurnUser;

            return (
              <motion.div
                layout
                key={p.id}
                className="player-card"
                initial={false}
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
                    border: isTurn ? "none" : "1px solid rgba(255,255,255,0.5)",
                    boxShadow: isTurn ? `0 0 5px ${p.color}` : "none",
                  }}
                />

                <div
                  className="player-name"
                  style={{
                    color: isTurn ? "#1f2937" : "#e5e7eb",
                    fontWeight: "800",
                    fontSize: "0.9rem",
                    marginBottom: "2px",
                    textAlign: "center",
                  }}
                >
                  {p.nome || p.username}
                </div>

                <div
                  className="player-money"
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    color: isTurn ? "#059669" : "#9ca3af",
                  }}
                >
                  {/* FORMATAÇÃO DO DINHEIRO AQUI */}
                  {Number(p.money).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* PALCO DO CARROSSEL */}
      <div className="carousel-stage">
        <AnimatePresence mode="popLayout" initial={false}>
          <PropertyCard
            key={`prop-${prevProp.id}`}
            prop={prevProp}
            positionStatus="prev"
            playersHere={jogadores.filter(
              (p) =>
                Number(p.posicao) === prevIndex &&
                p.username !== playerToFollow?.username,
            )}
          />

          <PropertyCard
            key={`prop-${currentProp.id}`}
            prop={currentProp}
            positionStatus="current"
            playersHere={[
              ...jogadores.filter(
                (p) =>
                  Number(p.posicao) === centerIndex &&
                  p.username !== playerToFollow?.username,
              ),
              playerToFollow,
            ].filter(Boolean)}
          />

          <PropertyCard
            key={`prop-${nextProp.id}`}
            prop={nextProp}
            positionStatus="next"
            playersHere={jogadores.filter(
              (p) =>
                Number(p.posicao) === nextIndex &&
                p.username !== playerToFollow?.username,
            )}
          />
        </AnimatePresence>

        <div
          style={{
            position: "absolute",
            bottom: "50px",
            width: "100%",
            textAlign: "center",
            color: "rgba(255,255,255,0.5)",
            fontSize: "0.9rem",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          {visualPos !== realTargetPos ? "Viajando..." : currentProp?.name}
        </div>
      </div>
    </div>
  );
};
