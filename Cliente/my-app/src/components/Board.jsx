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

// --- PEÃO TRAVADO NO GRID ---
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
      }}
      animate={{
        x: offsetX,
        y: offsetY,
        scale: [1, 1.25, 1],
      }}
      transition={{
        layout: { duration: 0.3, type: "spring", stiffness: 300, damping: 30 },
        x: { duration: 0.3 },
        y: { duration: 0.3 },
      }}
    />
  );
};

// --- BOARD PRINCIPAL ---
export const Board = ({ propriedadesServidor, jogadores }) => {
  const [isTvMode, setIsTvMode] = useState(true);
  const [machineActive, setMachineActive] = useState(false);

  const propsArray = Array.isArray(propriedadesServidor)
    ? propriedadesServidor
    : Object.values(propriedadesServidor || {});

  if (propsArray.length === 0) return <div>Carregando...</div>;

  function sendReceipt(data) {
    socket.emit("receipt", data);
  }

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

    // Limpeza (opcional, mas boa prática)
    return () => {
      socket.off("machineTransaction", onMachineTransaction);
    };
  }, []);

  return (
    <div className="game-container">
      <AnimatePresence mode="wait">
        {machineActive.status && (
          <BoardMachine
            valor={machineActive.valor}
            destinatario={machineActive.destinatario}
            remetente={machineActive.remetente}
            onFinish={() => {
              setMachineActive(false);
              sendReceipt({
                destinatario: machineActive.destinatario,
                valor: machineActive.valor,
                remetente: machineActive.remetente,
              });
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
            <motion.div layout className="player-container">
              {jogadores.map((p) => (
                <motion.div
                  layout
                  key={p.id}
                  className="player-card"
                  style={{ borderLeftColor: p.color }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="player-name" style={{ color: p.color }}>
                    {p.nome || p.username}
                  </div>
                  <div className="player-money">R$ {p.money}</div>
                </motion.div>
              ))}
            </motion.div>

            <div className="hud-controls">
              <motion.button
                className="btn-perspective"
                onClick={() => setIsTvMode(!isTvMode)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {!isTvMode ? "📺 Modo TV" : "🎲 Modo Mesa"}
              </motion.button>
            </div>
          </div>

          {/* CASAS DO TABULEIRO */}
          {propsArray.map((prop) => {
            const { x, y } = getCoords(prop.id);
            const sideClass = getTileSideClass(x, y);
            const cor = prop.themeColor || prop.color || "#ccc";
            const isCorner = (x === 1 || x === 11) && (y === 1 || y === 11);

            // 1. Acha o dono
            const dono = jogadores.find((j) => {
              // Usa o campo padronizado que criamos no AuxiliarScreen
              const propsDoJogador = j.propertiesIds || j.propriedades || [];

              // Garante que é um array para podermos usar .some ou .includes
              const listaProps = Array.isArray(propsDoJogador)
                ? propsDoJogador
                : Object.values(propsDoJogador);

              return listaProps.some((p) => {
                // Verifica se 'p' é um objeto (ex: {id: 1}) ou direto o ID (ex: 1)
                const idDaPosse = p && typeof p === "object" ? p.id : p;
                return Number(idDaPosse) === Number(prop.id);
              });
            });

            // 2. 🔥 CORREÇÃO CRÍTICA 🔥
            // Usamos APENAS os dados da propriedade global (prop) para nível/casas.
            // Removemos a verificação redundante dentro de 'dono', pois o backend
            // já garantiu que 'prop' está atualizado via 'emitPropertiesUpdate'.
            const nivelAtual = prop.level || 0;
            const casasAtuais = prop.houses || 0;

            let rotation = 0;
            if (!isTvMode) {
              if (sideClass === "tile-top") rotation = 180;
              if (sideClass === "tile-left") rotation = 90;
              if (sideClass === "tile-right") rotation = -90;
            }

            const tileStyle = { gridColumn: x, gridRow: y };
            if (dono) {
              tileStyle["--owner-color"] = dono.color;
            }

            return (
              <div
                key={`${prop.id}-${dono?.id || "livre"}`}
                className={`tile ${sideClass} ${dono ? "owned" : ""}`}
                style={tileStyle}
              >
                {!isCorner && (
                  <div
                    className="tile-strip"
                    style={{ backgroundColor: cor }}
                  />
                )}

                <motion.div
                  className="tile-content-wrapper"
                  animate={{ rotate: rotation }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="tile-name">
                    {prop.name}

                    {/* Renderiza o Nível (Hotéis) */}
                    {nivelAtual > 0 && (
                      <span
                        style={{
                          fontWeight: 900,
                          color: "#ffd700", // Dourado fica melhor no escuro
                          display: "block",
                          fontSize: "1.4rem",
                          zIndex: 1,
                          textShadow: "0px 0px 4px rgba(0,0,0,0.8)",
                        }}
                      >
                        {"★".repeat(nivelAtual)}
                      </span>
                    )}
                  </div>

                  {!dono && !isCorner && (prop.price || prop.valor) && (
                    <div className="tile-price">
                      R$ {prop.price || prop.valor}
                    </div>
                  )}

                  {/* Renderiza as Casas (Bolinhas) - Se o seu jogo usa casas separado de level */}
                  {/* Se usar apenas level, pode remover isso ou adaptar */}
                  {nivelAtual > 0 && nivelAtual < 5 && !isCorner && (
                    <div className="house-container">
                      {/* Exemplo visual simples baseado no nível */}
                      {Array.from({ length: nivelAtual }).map((_, i) => (
                        <div key={i} className="house-dot house-green" />
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            );
          })}

          {/* PEÕES */}
          {jogadores.map((player) => {
            const playersOnSameTarget = jogadores.filter(
              (p) => Number(p.posicao) === Number(player.posicao),
            );
            return (
              <GamePawn
                key={player.id}
                player={player}
                targetPos={player.posicao}
                playersOnSameSquare={playersOnSameTarget}
              />
            );
          })}
        </motion.div>
      </LayoutGroup>
    </div>
  );
};
