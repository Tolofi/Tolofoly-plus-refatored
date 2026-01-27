import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useMemo } from "react";

const styles = {
  skyContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
    top: 0,
    left: 0,
    zIndex: 0,
    overflow: "hidden",
    transition: "background 1s ease",
  },
  sun: {
    position: "absolute",
    top: "15%",
    right: "15%",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "#FFD966",
    boxShadow:
      "0 0 20px rgba(255, 216, 102, 0.8), 0 0 60px rgba(255, 200, 61, 0.6)",
    zIndex: 2,
  },
  moon: {
    position: "absolute",
    top: "15%",
    left: "15%",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#E6ECF2",
    boxShadow:
      "0 0 10px rgba(255, 255, 255, 0.8), 0 0 40px rgba(200, 220, 255, 0.4)",
    zIndex: 2,
  },
  // Estilo base da nuvem (cores serão sobrescritas se chover)
  cloud: {
    position: "absolute",
    width: "64px",
    height: "32px",
    borderRadius: "20px",
    zIndex: 3,
  },
  star: {
    position: "absolute",
    width: "2px",
    height: "2px",
    backgroundColor: "#FFF",
    borderRadius: "50%",
    zIndex: 1,
  },
};

// === Componente de Estrelas ===
const Stars = ({ count = 20 }) => {
  const stars = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      top: Math.random() * 60 + "%",
      left: Math.random() * 100 + "%",
      opacity: Math.random(),
    }));
  }, [count]);

  return (
    <>
      {stars.map((s, i) => (
        <motion.div
          key={i}
          style={{
            ...styles.star,
            top: s.top,
            left: s.left,
            opacity: s.opacity,
          }}
          animate={{ opacity: [s.opacity, 0.2, s.opacity] }}
          transition={{ duration: 2 + Math.random(), repeat: Infinity }}
        />
      ))}
    </>
  );
};

// === NOVO: Componente Gota de Chuva Única ===
const Raindrop = () => {
  // Posição horizontal aleatória
  const randomLeft = useMemo(() => Math.random() * 100, []);
  // Delay negativo aleatório para começar já chovendo em pontos diferentes
  const randomDelay = useMemo(() => Math.random() * -2, []);
  // Velocidade variada (gotas mais rápidas parecem mais próximas)
  const duration = useMemo(() => 0.6 + Math.random() * 0.4, []);

  return (
    <motion.div
      style={{
        position: "absolute",
        left: `${randomLeft}%`,
        top: -20, // Começa fora da tela
        width: "2px", // Gota fina
        height: "15px", // Gota comprida (efeito de velocidade)
        backgroundColor: "#90A4AE", // Azul acinzentado
        opacity: 0.8,
        borderRadius: "2px",
        zIndex: 4, // Fica na frente das nuvens
      }}
      // Anima de cima para baixo (passando 100% da altura)
      animate={{ y: ["0vh", "100vh"] }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "linear",
        delay: randomDelay,
      }}
    />
  );
};

// === NOVO: Componente Container de Chuva ===
const Rain = ({ drops = 60 }) => {
  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        zIndex: 4,
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: drops }).map((_, i) => (
        <Raindrop key={i} />
      ))}
    </div>
  );
};

// === Componente Nuvens (Atualizado para suportar cor de chuva) ===
export const Clouds = ({ random, weather }) => {
  const isRainy = weather === "rainy";

  // Cores dinâmicas baseadas no clima
  const cloudColor = isRainy ? "#546E7A" : "#FFFFFF"; // Cinza chumbo vs Branco
  const shadowColor = isRainy ? "#455A64" : "#FFFFFF"; // Sombra mais escura vs Branca

  const [config] = useState(() => {
    const duration = Math.floor(Math.random() * (35 - 15 + 1)) + 15;
    return {
      top: Math.floor(Math.random() * (50 - 2 + 1)) + 2,
      duration: duration,
      scale: Math.random() * 1.0 + 0.8,
      // Se estiver chovendo, as nuvens são mais opacas (pesadas)
      opacity: isRainy ? Math.random() * 0.2 + 0.8 : Math.random() * 0.4 + 0.4,
      delay: -Math.random() * duration,
    };
  });

  return (
    <motion.div
      style={{
        ...styles.cloud,
        // Aplicando cores dinâmicas
        backgroundColor: cloudColor,
        boxShadow: `8px 0 0 ${shadowColor}, 16px 2px 0 ${shadowColor}, 6px -4px 0 ${shadowColor}`,
        // Configurações de posição
        top: `${config.top}%`,
        left: 0,
        position: "absolute",
        scale: config.scale,
        opacity: config.opacity,
      }}
      animate={{ x: [-150, 450] }}
      transition={{
        repeat: Infinity,
        repeatType: "loop",
        duration: config.duration,
        ease: "linear",
        delay: config.delay,
      }}
    />
  );
};

// === Componente Principal do Céu (Atualizado) ===
// Agora aceita a prop 'weather' ("clear" ou "rainy")
export const Sky = ({ hour, weather = "clear", cloudsNumber = 3 }) => {
  const isRainy = weather === "rainy";

  // Lógica do Background
  let backgroundStyle;
  if (isRainy) {
    // Gradiente cinza pesado para chuva (independente se é dia ou noite)
    backgroundStyle = "linear-gradient(to bottom, #37474F 0%, #607D8B 100%)";
  } else {
    backgroundStyle =
      hour === "dia"
        ? "linear-gradient(to bottom, #87CEEB 0%, #E0F7FA 100%)"
        : "linear-gradient(to bottom, #0F2027 0%, #203A43 100%)";
  }

  // Condição para mostrar astros: Só mostra se NÃO estiver chovendo.
  const showCelestialBodies = !isRainy;

  return (
    <div style={{ ...styles.skyContainer, background: backgroundStyle }}>
      {/* Estrelas (Só à noite E se não estiver chovendo) */}
      <AnimatePresence>
        {hour === "noite" && showCelestialBodies && (
          <motion.div
            key="stars"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{ position: "absolute", width: "100%", height: "100%" }}
          >
            <Stars count={30} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chuva (Só aparece se weather for "rainy") */}
      {isRainy && <Rain drops={80} />}

      {/* Nuvens (Sempre presentes, mas mudam de cor baseadas no weather) */}
      {Array.from({ length: cloudsNumber }).map((_, i) => (
        <Clouds key={i} random weather={weather} />
      ))}

      {/* Sol e Lua (Só aparecem se NÃO estiver chovendo) */}
      <AnimatePresence mode="wait">
        {hour === "dia" && showCelestialBodies ? (
          <motion.div
            key="sun"
            style={styles.sun}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        ) : (
          // Se for noite E não estiver chovendo
          hour === "noite" &&
          showCelestialBodies && (
            <motion.div
              key="moon"
              style={styles.moon}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          )
        )}
      </AnimatePresence>
    </div>
  );
};
