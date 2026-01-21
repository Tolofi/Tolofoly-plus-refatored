import React, { useState, useEffect } from "react";
import { motion, LayoutGroup } from "framer-motion";

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

  const propsArray = Array.isArray(propriedadesServidor)
    ? propriedadesServidor
    : Object.values(propriedadesServidor || {});

  if (propsArray.length === 0) return <div>Carregando...</div>;

  return (
    <div className="game-container">
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
                  <div className="player-name" style={{ color: p.color}}>{p.nome || p.username}</div>
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
                {isTvMode ? "📺 Modo TV" : "🎲 Modo Mesa"}
              </motion.button>
            </div>
          </div>

          {/* CASAS DO TABULEIRO */}
          {propsArray.map((prop) => {
            const { x, y } = getCoords(prop.id);
            const sideClass = getTileSideClass(x, y);
            const cor = prop.themeColor || prop.color || "#ccc";
            const isCorner = (x === 1 || x === 11) && (y === 1 || y === 11);

            // 1. Acha o dono (Igual você já fazia)
            const dono = jogadores.find((j) =>
              Object.values(j.propriedades || {}).some(
                (p) => Number(p.id) === Number(prop.id)
              )
            );

            // 2. CORREÇÃO: Define o nível olhando para o dono (se existir)
            let nivelAtual = prop.level || 0; // Padrão do tabuleiro
            let casasAtuais = prop.houses || 0;

            if (dono) {
              // Pega o objeto da propriedade que está DENTRO do jogador
              const propDoDono = Object.values(dono.propriedades).find(
                (p) => Number(p.id) === Number(prop.id)
              );

              if (propDoDono) {
                // Se o jogador tiver essa informação, usamos ela prioritariamente
                if (propDoDono.level !== undefined)
                  nivelAtual = propDoDono.level;
                // Alguns backends usam 'houses' ao invés de level, garantindo ambos:
                if (propDoDono.houses !== undefined)
                  casasAtuais = propDoDono.houses;
              }
            }

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
                key={prop.id}
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
                    {/* AQUI ESTAVA O ERRO: Usamos 'nivelAtual' ao invés de 'prop.level' */}
                    {nivelAtual > 0 && (
                      <span
                        style={{
                          fontWeight: 900,
                          color: "green",
                          display: "block",
                          fontSize: "1.2rem",
                          zIndex: 1,
                        }}
                      >
                        {"⌂".repeat(nivelAtual)}
                      </span>
                    )}
                  </div>

                  {!dono && !isCorner && (prop.price || prop.valor) && (
                    <div className="tile-price">
                      R$ {prop.price || prop.valor}
                    </div>
                  )}

                  {/* LÓGICA DAS BOLINHAS (Também atualizada para usar casasAtuais se quiser) */}
                  {casasAtuais > 0 && !isCorner && (
                    <div className="house-container">
                      {casasAtuais === 5 ? (
                        <div className="house-dot house-red" />
                      ) : (
                        Array.from({ length: casasAtuais }).map((_, i) => (
                          <div key={i} className="house-dot house-green" />
                        ))
                      )}
                    </div>
                  )}
                </motion.div>
              </div>
            );
          })}

          {/* PEÕES */}
          {jogadores.map((player) => {
            const playersOnSameTarget = jogadores.filter(
              (p) => Number(p.posicao) === Number(player.posicao)
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
