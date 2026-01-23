import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useEffect, useState } from "react";

export const FloatingReceipt = ({
  valor = "1.500",
  destinatario = "BANCO",
  remetente = "JOÃO",
  onFinish,
}) => {
  const controls = useAnimation();
  const [isGone, setIsGone] = useState(false);

  // 1. Criamos valores para X e Y
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // 2. Rotação Dinâmica: Conforme move no X (-150 a 150), gira um pouco (-10 a 10 graus)
  const rotateX = useTransform(x, [-150, 150], [-10, 10]);

  // 🌊 LÓGICA DE ANIMAÇÃO
  useEffect(() => {
    const sequence = async () => {
      // Entrada
      await controls.start({
        y: 0,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 200,
          damping: 20,
          duration: 0.8,
        },
      });

      // Loop Idle (Samba)
      if (!isGone) {
        controls.start({
          y: [0, -10, 0],
          transition: {
            duration: 4,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          },
        });
      }
    };

    if (!isGone) sequence();
  }, []);

  const handleDragEnd = async (_, info) => {
    const passedThreshold = info.offset.y > 100;
    const isFlicked = info.velocity.y > 500;

    // ❌ Não passou → volta para o centro (X:0, Y:0)
    if (!passedThreshold && !isFlicked) {
      await controls.start({
        x: 0, // Reseta horizontal
        y: 0, // Reseta vertical
        rotate: 0, // Reseta rotação
        transition: { type: "spring", stiffness: 300, damping: 25 },
      });

      // Reinicia o loop idle
      controls.start({
        y: [0, -10, 0],
        transition: {
          duration: 4,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        },
      });
      return;
    }

    // ✅ Passou → sugado pra baixo
    setIsGone(true);

    await controls.start({
      y: 800,
      scale: 0.5,
      opacity: 0,
      rotate: Math.random() * 20 - 10, // Gira aleatório ao cair
      transition: { duration: 0.4, ease: "backIn" },
    });

    if (onFinish) onFinish();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: 40,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <motion.div
        style={{
          x, // Liga o movimento X
          y, // Liga o movimento Y
          rotate: rotateX, // Aplica a rotação baseada no X
          width: 150,
          background: "#fffce3",
          color: "#333",
          fontFamily: "monospace",
          fontSize: 12,
          padding: 10,
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          borderTop: "1px dashed #ccc",
          borderRadius: 4,
          cursor: "grab",
          pointerEvents: "auto",
        }}
        initial={{ y: -300, opacity: 0 }}
        animate={controls}
        // 3. CONFIGURAÇÕES DE ARRASTE LIBERADO
        drag // Sem valor = Livre (X e Y)
        dragConstraints={{ top: -50, bottom: 300, left: -150, right: 150 }} // Limites laterais
        dragElastic={0.2}
        dragSnapToOrigin={true} // Ajuda a voltar pro centro se soltar
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.05, cursor: "grabbing" }}
      >
        {/* Serrilhado */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 4,
            background:
              "repeating-linear-gradient(45deg, transparent, transparent 2px, #fff 2px, #fff 4px)",
          }}
        />

        <div
          style={{
            textAlign: "center",
            borderBottom: "1px dashed #999",
            paddingBottom: 4,
            marginBottom: 6,
            fontWeight: "bold",
          }}
        >
          VIA DO CLIENTE
        </div>

        <div style={{ lineHeight: 1.4 }}>
          <p style={{ textAlign: "center", margin: 0 }}>TOLOFI BANK</p>
          <p style={{ textAlign: "center", margin: 0 }}>────────────</p>

          <p style={{ margin: 0 }}>DE: {remetente}</p>
          <p style={{ margin: 0 }}>PARA: {destinatario}</p>

          <p style={{ margin: "4px 0" }}>
            VALOR: <strong>R$ {valor}</strong>
          </p>

          <p style={{ textAlign: "center", margin: 0 }}>────────────</p>

          <p style={{ textAlign: "center", fontSize: 9, margin: 0 }}>
            {new Date().toLocaleTimeString()}
          </p>
          <p style={{ textAlign: "center", fontSize: 9, margin: 0 }}>
            AUT: 882910
          </p>
        </div>
      </motion.div>
    </div>
  );
};
