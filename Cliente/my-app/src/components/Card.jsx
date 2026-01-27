import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useEffect, useState } from "react";

export const Card = ({ onThrow, playerName = "JOÃO", balance = "1.500" }) => {
  const controls = useAnimation();
  const [isThrown, setIsThrown] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateZ = useTransform(x, [-200, 200], [-15, 15]);
  const rotateX = useTransform(y, [-200, 200], [10, -10]);

  // 🌊 Flutuação padrão
  useEffect(() => {
    if (!isThrown) {
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
  }, [isThrown, controls]);

  const handleDragEnd = async (_, info) => {
    const passedThreshold = info.offset.y < -250;
    const isFlicked = info.velocity.y < -600;

    if (!passedThreshold && !isFlicked) {
      await controls.start({
        x: 0,
        y: 0,
        rotate: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 25,
        },
      });
      return;
    }

    const targetX = x.get() + info.velocity.x * 0.3;

    await controls.start({
      y: -1200,
      x: targetX,
      scale: 0.4,
      opacity: 0,
      rotate: Math.random() * 30 - 15,
      transition: {
        duration: 0.6,
        ease: "backIn",
      },
    });

    setIsThrown(true);
    onThrow?.();
  };

  return (
    <>
      <AnimatePresence>
        {!isThrown && (
          <motion.div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(10px)",
              zIndex: 9998,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: 50,
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        <motion.div
          style={{
            x,
            y,
            rotateZ,
            rotateX,
            width: 140,
            height: 220,
            borderRadius: 10,
            background: "linear-gradient(180deg, #1e85e0, #000428)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            color: "white",
            paddingTop: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "grab",
            pointerEvents: "auto",
            userSelect: "none",
          }}
          animate={controls}
          drag
          dragConstraints={{ top: -300, left: -150, right: 150, bottom: 50 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          whileDrag={{ scale: 1.1 }}
          whileTap={{ scale: 1.05 }}
        >
          {/* CHIP */}
          <div
            style={{
              width: 28,
              height: 36,
              background: "#e0c068",
              borderRadius: 5,
              marginBottom: 15,
              border: "1px solid #b89c50",
              boxShadow: "inset 0 0 2px rgba(0,0,0,0.4)",
            }}
          />

          {/* SALDO */}
          {/* <div
            style={{
              fontSize: 14,
              fontWeight: "bold",
              marginBottom: 6,
            }}
          >
            R$ {balance}
          </div> */}

          {/* NOME */}
          <div
            style={{
              fontSize: 12,
              fontWeight: "bold",
              textAlign: "center",
              padding: "0 8px",
              lineHeight: 1.2,
            }}
          >
            {playerName}
          </div>

          {/* NUMERO */}
          <div
            style={{
              marginTop: "auto",
              marginBottom: 15,
              fontSize: 8,
              opacity: 0.7,
              letterSpacing: 1.5,
            }}
          >
            •••• 8092
          </div>
        </motion.div>
      </div>
    </>
  );
};
