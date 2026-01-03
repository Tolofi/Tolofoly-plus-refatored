import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const DiceFace = ({ valor }) => {
  const dots = {
    1: [[50, 50]],
    2: [
      [20, 20],
      [80, 80],
    ],
    3: [
      [20, 20],
      [50, 50],
      [80, 80],
    ],
    4: [
      [20, 20],
      [20, 80],
      [80, 20],
      [80, 80],
    ],
    5: [
      [20, 20],
      [20, 80],
      [50, 50],
      [80, 20],
      [80, 80],
    ],
    6: [
      [20, 20],
      [20, 50],
      [20, 80],
      [80, 20],
      [80, 50],
      [80, 80],
    ],
  };

  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100">
      <rect
        x="2"
        y="2"
        width="96"
        height="96"
        rx="16"
        fill="white"
        stroke="#e5e7eb"
        strokeWidth="2"
      />
      {dots[valor]?.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="8" fill="#1f2937" />
      ))}
    </svg>
  );
};

export const DadoUnitario = ({ valor, agitado }) => {
  // Estado para controlar o número visual "fake" enquanto gira
  const [valorVisual, setValorVisual] = useState(1);

  useEffect(() => {
    let interval;
    if (agitado) {
      // Troca o número a cada 100ms (velocidade realista de um dado)
      interval = setInterval(() => {
        setValorVisual(Math.floor(Math.random() * 6) + 1);
      }, 100);
    } else {
      // Se parou de agitar, garante que mostra o valor final real
      setValorVisual(valor);
    }
    return () => clearInterval(interval);
  }, [agitado, valor]);

  return (
    <motion.div
      style={{
        width: 80,
        height: 80,
        borderRadius: 20,
        background: "#fff",
        boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      animate={
        agitado
          ? {
              rotate: [0, 10, -10, 5, -5, 0],
              x: [0, 5, -5, 3, -3, 0],
              y: [0, 5, -5, 0],
            }
          : { rotate: 0, x: 0, y: 0 }
      }
      transition={
        agitado ? { duration: 0.2, repeat: Infinity } : { duration: 0.5 }
      }
    >
      <DiceFace valor={valorVisual} />
    </motion.div>
  );
};
