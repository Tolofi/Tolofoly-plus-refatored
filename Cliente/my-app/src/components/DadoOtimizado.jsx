import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Desenhos dos pontos do dado usando SVG (Zero peso no processador)
const DiceFace = ({ valor }) => {
  // Posições dos pontos (cx, cy) para um dado padrão
  const dots = {
    1: [[50, 50]],
    2: [[20, 20], [80, 80]],
    3: [[20, 20], [50, 50], [80, 80]],
    4: [[20, 20], [20, 80], [80, 20], [80, 80]],
    5: [[20, 20], [20, 80], [50, 50], [80, 20], [80, 80]],
    6: [[20, 20], [20, 50], [20, 80], [80, 20], [80, 50], [80, 80]]
  };

  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100">
      {/* Fundo do Dado (Branco com borda e sombra leve) */}
      <rect x="2" y="2" width="96" height="96" rx="15" fill="white" stroke="#e5e7eb" strokeWidth="2" />
      
      {/* Pontos */}
      {dots[valor]?.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="8" fill="#1f2937" />
      ))}
    </svg>
  );
};

export const DadoOtimizado = ({ valorFinal, rolando }) => {
  const [valorVisual, setValorVisual] = useState(1);

  useEffect(() => {
    let interval;
    if (rolando) {
      // Troca o número a cada 100ms para criar efeito de "embaralhar"
      interval = setInterval(() => {
        setValorVisual(Math.floor(Math.random() * 6) + 1);
      }, 80);
    } else {
      // Quando para, mostra o valor real vindo do servidor
      setValorVisual(valorFinal);
    }
    return () => clearInterval(interval);
  }, [rolando, valorFinal]);

  return (
    <motion.div
      style={{
        width: 100,
        height: 100,
        borderRadius: 24,
        background: "#fff",
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
      }}
      // Animação: Se estiver rolando, gira e vibra. Se não, para quieto.
      animate={
        rolando
          ? {
              rotate: [0, 90, 180, 270, 360], // Gira completo
              scale: [1, 1.1, 0.9, 1.1, 1],   // Pulsa ("respira")
              x: [0, -5, 5, -5, 5, 0],        // Treme para os lados
              y: [0, -5, 5, -5, 5, 0],        // Treme para cima/baixo
            }
          : {
              rotate: 0,
              scale: 1,
              x: 0,
              y: 0
            }
      }
      transition={
        rolando
          ? {
              duration: 0.6, // Gira rápido
              repeat: Infinity, // Não para enquanto 'rolando' for true
              ease: "linear",
            }
          : {
              type: "spring", // Aterrissagem suave
              stiffness: 200,
              damping: 15
            }
      }
    >
      <DiceFace valor={valorVisual} />
    </motion.div>
  );
};