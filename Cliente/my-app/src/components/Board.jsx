import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  LayoutGroup,
  AnimatePresence,
  useAnimation,
} from "framer-motion";

// --- HELPERS ---

// Converte ID da casa (0-39) para coordenadas X/Y no grid 11x11
const getCoords = (id) => {
  const shiftedId = (id + 5) % 40;
  if (shiftedId >= 0 && shiftedId <= 10) return { x: 11 - shiftedId, y: 11 };
  if (shiftedId >= 11 && shiftedId <= 20)
    return { x: 1, y: 11 - (shiftedId - 10) };
  if (shiftedId >= 21 && shiftedId <= 30)
    return { x: 1 + (shiftedId - 20), y: 1 };
  if (shiftedId >= 31 && shiftedId <= 39)
    return { x: 11, y: 1 + (shiftedId - 30) };
  return { x: 6, y: 11 };
};

// Componente utilitário para animar números/textos mudando
const AnimatedText = ({ children, className, customKey, style }) => (
  <div
    className={className}
    style={{ position: "relative", overflow: "hidden", ...style }}
  >
    <AnimatePresence mode="wait">
      <motion.div
        key={customKey || children}
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -8, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  </div>
);

// --- COMPONENTE DO PEÃO SALTITANTE ---
const GamePawn = ({ player, targetPos, indexNoGrupo, totalNoGrupo }) => {
  const [visualPos, setVisualPos] = useState(Number(player.posicao));
  const controls = useAnimation();
  const timeoutRef = useRef(null);
  const finalPos = Number(targetPos);

  useEffect(() => {
    if (visualPos === finalPos) return;

    const proximoPasso = (visualPos + 1) % 40;
    const velocidadePasso = 300;

    controls.start({
      scale: [1, 1.4, 1],
      transition: { duration: 0.25, times: [0, 0.5, 1] },
    });

    timeoutRef.current = setTimeout(() => {
      setVisualPos(proximoPasso);
    }, velocidadePasso);

    return () => clearTimeout(timeoutRef.current);
  }, [visualPos, finalPos, controls]);

  const coords = getCoords(visualPos);
  const offsetBase = 8;
  const totalWidth = (totalNoGrupo - 1) * offsetBase;
  const startX = -totalWidth / 2;
  const offsetX = startX + indexNoGrupo * offsetBase;
  const offsetY = indexNoGrupo % 2 === 0 ? 0 : 5;

  return (
    <motion.div
      layout
      animate={controls}
      className="pawn"
      style={{
        gridColumn: coords.x,
        gridRow: coords.y,
        justifySelf: "center",
        alignSelf: "center",
        background: player.color,
        width: "16px",
        height: "16px",
        borderRadius: "50%",
        border: "2px solid white",
        boxShadow: "0 4px 6px rgba(0,0,0,0.4)",
        zIndex: 100 + indexNoGrupo,
        x: offsetX,
        y: offsetY,
      }}
      transition={{
        layout: {
          type: "spring",
          stiffness: 180,
          damping: 12,
          mass: 0.8,
        },
      }}
    />
  );
};

// --- COMPONENTE PRINCIPAL (BOARD) ---

export const Board = ({ propriedadesServidor, jogadores }) => {
  const propsArray = Array.isArray(propriedadesServidor)
    ? propriedadesServidor
    : Object.values(propriedadesServidor || {});

  const propriedadesMercado = propsArray.filter((p) => p.price || p.valor);

  const meioJogadores = Math.ceil(jogadores.length / 2);
  const colJogadores1 = jogadores.slice(0, meioJogadores);
  const colJogadores2 = jogadores.slice(meioJogadores);

  const meioProps = Math.ceil(propriedadesMercado.length / 2);
  const colProps1 = propriedadesMercado.slice(0, meioProps);
  const colProps2 = propriedadesMercado.slice(meioProps);

  // Sub-componente: Coluna de Jogadores
  const PlayerColumn = ({ lista }) => (
    <div className="sidebar-column">
      {lista.map((player) => {
        const propsPessoais = Object.values(player.propriedades || {}).length;
        const casaAtual = propsArray.find(
          (p) => Number(p.id) === Number(player.posicao)
        );
        const corCasa = casaAtual?.themeColor || casaAtual?.color || "#808080";

        return (
          <motion.div
            key={player.id}
            layout
            className="player-card"
            style={{ borderLeft: `5px solid ${player.color}` }}
          >
            <div className="player-header">
              <div className="player-name">
                {player.nome || player.username}
              </div>
              <AnimatedText className="player-money">
                R$ {player.money || 0}
              </AnimatedText>
            </div>
            <div className="player-header" style={{ marginTop: "8px" }}>
              <div
                className="location-badge"
                style={{ borderColor: `${corCasa}44` }}
              >
                <motion.div
                  className="location-dot"
                  animate={{
                    backgroundColor: corCasa,
                    boxShadow: `0 0 10px ${corCasa}`,
                  }}
                />
                <AnimatedText className="location-text">
                  {casaAtual?.name || "Viajando..."}
                </AnimatedText>
              </div>
              <span className="prop-count">{propsPessoais}/30</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  // Sub-componente: Coluna de Propriedades (ATUALIZADO: Sem preço, com casas)
  const PropertyColumn = ({ lista }) => (
    <div className="sidebar-column market-column">
      {lista.map((prop) => {
        const dono = jogadores.find((j) =>
          Object.values(j.propriedades || {}).some(
            (p) => Number(p.id) === Number(prop.id)
          )
        );

        // Pega a cor
        const cor = prop.themeColor || prop.color || "#888";

        return (
          <div
            key={prop.id}
            className="prop-row-item"
            style={{
              // O gradiente vai da cor com 40% opacidade até quase transparente
              // Isso garante que a cor domine, mas o texto continue legível
              background: `linear-gradient(90deg, ${cor}55 0%, ${cor}15 100%)`,
              borderLeft: `4px solid ${cor}`,
            }}
          >
            {/* GRUPO ESQUERDA: Nome (Removemos o quadradinho de cor) */}
            <div className="prop-left-group">
              <span className="prop-row-name">{prop.name || prop.nome}</span>
            </div>

            {/* GRUPO DIREITA: Casas e Dono */}
            <div className="prop-row-details">
              <span className="prop-row-houses">🏠 {prop.houses || 0}</span>

              <div
                className="prop-row-owner"
                style={{
                  // Se tiver dono, usa a cor do dono Sólida.
                  // Se for livre, fundo escuro semitransparente
                  backgroundColor: dono ? dono.color : "rgba(0,0,0,0.5)",
                  color: "white",
                  opacity: dono ? 1 : 0.7,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                {dono ? (dono.nome || dono.username).substring(0, 4) : "LIVRE"}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (propsArray.length === 0)
    return <div className="loading">Carregando Tabuleiro...</div>;

  return (
    <div className="game-container">
      {/* LADO ESQUERDO: LISTA DE JOGADORES */}
      <PlayerColumn lista={colJogadores1} />
      <PlayerColumn lista={colJogadores2} />

      {/* CENTRO: TABULEIRO */}
      <div className="board-grid" style={{ position: "relative" }}>
        {/* CAMADA 1: Casas do Tabuleiro */}
        {propsArray.map((prop) => {
          const { x, y } = getCoords(prop.id);
          const cor = prop.themeColor || prop.color || "#ccc";
          const temPreco = prop.price || prop.valor;

          return (
            <div
              key={prop.id}
              className="tile"
              style={{
                gridColumn: x,
                gridRow: y,
                border: `2px solid ${cor}`,
              }}
            >
              <div className="tile-strip" style={{ background: cor }} />
              <span className="tile-name">{prop.name || prop.nome}</span>

              {/* NOVO: Preço sutil no tabuleiro */}
              {temPreco && (
                <span className="tile-price">
                  R$ {prop.price || prop.valor}
                </span>
              )}
            </div>
          );
        })}

        {/* CAMADA 2: Peões */}
        {jogadores.map((player) => {
          const jogadoresNaMesmaCasa = jogadores.filter(
            (p) => Number(p.posicao) === Number(player.posicao)
          );
          const indexNoGrupo = jogadoresNaMesmaCasa.findIndex(
            (p) => p.id === player.id
          );

          return (
            <GamePawn
              key={player.id}
              player={player}
              targetPos={player.posicao}
              indexNoGrupo={indexNoGrupo}
              totalNoGrupo={jogadoresNaMesmaCasa.length}
            />
          );
        })}
      </div>

      {/* LADO DIREITO: LISTA DE PROPRIEDADES */}
      <PropertyColumn lista={colProps1} />
      <PropertyColumn lista={colProps2} />
    </div>
  );
};
