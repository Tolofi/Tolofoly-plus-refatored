import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useMemo, useEffect } from "react";

// === Configurações de Estilo ===
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
  lightning: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#FFFFFF",
    zIndex: 1,
    pointerEvents: "none",
  },
};

// === Componente: Relâmpago ===
const Lightning = () => {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const trigger = () => {
      if (Math.random() > 0.6) {
        setFlash(true);
        setTimeout(() => setFlash(false), 50 + Math.random() * 150);
      }
    };
    const interval = setInterval(trigger, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {flash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0.2, 0.8, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={styles.lightning}
        />
      )}
    </AnimatePresence>
  );
};

// === Componente: Estrelas ===
const Stars = ({ count = 30 }) => {
  const stars = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        top: Math.random() * 60 + "%",
        left: Math.random() * 100 + "%",
        opacity: Math.random(),
      })),
    [count],
  );

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

// === Componente: Gota de Chuva (Espessura Original) ===
const Raindrop = ({ isStormy }) => {
  const randomLeft = useMemo(() => Math.random() * 120 - 10, []);
  const randomDelay = useMemo(() => Math.random() * -2, []);
  const duration = useMemo(
    () => (isStormy ? 0.5 : 0.8) + Math.random() * 0.3,
    [isStormy],
  );

  return (
    <motion.div
      style={{
        position: "absolute",
        left: `${randomLeft}%`,
        top: -20,
        width: "2px", // Espessura original que você pediu
        height: isStormy ? "25px" : "15px",
        backgroundColor: isStormy ? "#90A4AE" : "#B0BEC5",
        opacity: 0.6,
        zIndex: 4,
      }}
      animate={{
        y: ["0vh", "110vh"],
        x: isStormy ? -40 : 0, // Vento na tempestade
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "linear",
        delay: randomDelay,
      }}
    />
  );
};

// === Componente: Chuva ===
const Rain = ({ isStormy }) => {
  const dropsCount = isStormy ? 100 : 60;
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
      {Array.from({ length: dropsCount }).map((_, i) => (
        <Raindrop key={i} isStormy={isStormy} />
      ))}
    </div>
  );
};

// === Componente: Nuvens ===
const Clouds = ({ weather }) => {
  const isRainy = weather === "rainy";
  const isStormy = weather === "stormy";

  const cloudColor = isStormy ? "#37474F" : isRainy ? "#546E7A" : "#FFFFFF";
  const shadowColor = isStormy ? "#263238" : isRainy ? "#455A64" : "#FFFFFF";

  const [config] = useState(() => {
    const baseDuration = Math.floor(Math.random() * 15) + 20;
    return {
      top: Math.floor(Math.random() * 40) + 5,
      duration: isStormy ? baseDuration * 0.6 : baseDuration,
      scale: Math.random() * 1.2 + 0.8,
      opacity: isRainy || isStormy ? 0.9 : 0.6,
      delay: -Math.random() * 20,
    };
  });

  return (
    <motion.div
      style={{
        ...styles.cloud,
        backgroundColor: cloudColor,
        boxShadow: `8px 0 0 ${shadowColor}, 16px 2px 0 ${shadowColor}, 6px -4px 0 ${shadowColor}`,
        top: `${config.top}%`,
        scale: config.scale,
        opacity: config.opacity,
      }}
      animate={{ x: [-200, 600] }}
      transition={{
        repeat: Infinity,
        duration: config.duration,
        ease: "linear",
        delay: config.delay,
      }}
    />
  );
};

// === COMPONENTE PRINCIPAL ===
export const Sky = ({ hour = "dia", weather = "clear", cloudsNumber = 4 }) => {
  const isRainy = weather === "rainy";
  const isStormy = weather === "stormy";
  const isBadWeather = isRainy || isStormy;

  const backgroundStyle = useMemo(() => {
    if (isStormy) return "linear-gradient(to bottom, #10171d 0%, #2c3e50 100%)";
    if (isRainy) return "linear-gradient(to bottom, #37474F 0%, #607D8B 100%)";
    return hour === "dia"
      ? "linear-gradient(to bottom, #87CEEB 0%, #E0F7FA 100%)"
      : "linear-gradient(to bottom, #0F2027 0%, #203A43 100%)";
  }, [hour, weather]);

  return (
    <div style={{ ...styles.skyContainer, background: backgroundStyle }}>
      {isStormy && <Lightning />}

      <AnimatePresence>
        {hour === "noite" && !isBadWeather && (
          <motion.div
            key="stars"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Stars count={40} />
          </motion.div>
        )}
      </AnimatePresence>

      {isBadWeather && <Rain isStormy={isStormy} />}

      {Array.from({ length: cloudsNumber }).map((_, i) => (
        <Clouds key={i} weather={weather} />
      ))}

      <AnimatePresence mode="wait">
        {!isBadWeather && (
          <motion.div
            key={hour}
            style={hour === "dia" ? styles.sun : styles.moon}
            initial={{ y: 150, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 150, opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Lógica de sorteio para você usar no seu gerenciador de estado:
/*
randomWeather() {
  const rand = Math.random();
  if (rand < 0.2) return "stormy"; // 20%
  if (rand < 0.4) return "rainy";  // 20%
  return "clear";                 // 60%
}
*/

export default Sky;
