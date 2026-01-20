import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DadoUnitario } from "./DadoUnitario";
import { splitTotalIntoTwoDice } from "../diceLogic";
import { useGameStore } from "../store";

export const RolarDados = ({
  click,
  serverTotal = 0,
  pularVez,
  onComplete = () => { },
  d1 = null,
  d2 = null,
  isProcessing = false,
  tentarSoltar, // <--- Importante: Recebendo a função
}) => {
  /**
   * FASES:
   * IDLE          → botão "Jogar"
   * WAITING_SERVER → dado 1 girando
   * SHOW_D1        → dado 1 para
   * ROLLING_D2     → dado 2 entra
   * FINAL          → resultado final
   */
  const [fase, setFase] = useState("IDLE");
  const [dado1, setDado1] = useState(1);
  const [dado2, setDado2] = useState(1);
  const playerObject = useGameStore((state) => state.meAsObject);

  /* ======================================================
      MODO FAKE (Revelar dados via Props)
     ====================================================== */
  useEffect(() => {
    if (d1 && d2 && fase === "IDLE") {
      setDado1(d1);
      setDado2(d2);
      setFase("WAITING_SERVER");

      setTimeout(() => {
        playAnimationSequence();
      }, 1000);
    }
  }, [d1, d2]);

  /* ======================================================
      MODO SERVIDOR (Via serverTotal)
     ====================================================== */
  useEffect(() => {
    if (serverTotal > 0 && fase === "WAITING_SERVER") {
      const [v1, v2] = splitTotalIntoTwoDice(serverTotal);
      setDado1(v1);
      setDado2(v2);

      setTimeout(() => {
        playAnimationSequence();
      }, 1500);
    }
  }, [serverTotal, fase]);

  /* ======================================================
      SEQUÊNCIA DE ANIMAÇÃO
     ====================================================== */
  const playAnimationSequence = () => {
    setFase("SHOW_D1");

    setTimeout(() => {
      setFase("ROLLING_D2");

      setTimeout(() => {
        setFase("FINAL"); // Aqui os dados pararam totalmente

        // Aqui definimos quanto tempo o dado fica parado na tela antes de sumir.
        // 1500ms (1.5 segundos) é um tempo bom para ler o resultado.
        if (onComplete) {
          setTimeout(() => {
            onComplete();
          }, 1500);
        }

      }, 1500); // Tempo do dado 2 girando
    }, 1000); // Tempo do dado 1 girando sozinho
  };

  const handleRollClick = () => {
    setFase("WAITING_SERVER");
    click?.();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(10px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
    >
      {/* CONTAINER DOS DADOS */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
          minHeight: "150px",
          width: "100%",
        }}
      >
        {/* DADO 1 */}
        <motion.div
          animate={{
            y: fase === "ROLLING_D2" ? -20 : 0,
            scale: fase === "WAITING_SERVER" ? 1.1 : 1,
          }}
          transition={{ type: "spring", stiffness: 150, damping: 18 }}
        >
          <DadoUnitario valor={dado1} agitado={fase === "WAITING_SERVER"} />
        </motion.div>

        {/* DADO 2 */}
        <AnimatePresence>
          {(fase === "ROLLING_D2" || fase === "FINAL") && (
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.5 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 120 }}
            >
              <DadoUnitario valor={dado2} agitado={fase === "ROLLING_D2"} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* INTERFACE DE CONTROLE */}
      <div style={{ height: "150px", display: "flex", alignItems: "center" }}>
        {/* BOTÃO JOGAR (Só aparece se NÃO estiver preso) */}
        {fase === "IDLE" && !d1 && !playerObject.preso && !isProcessing && (
          <motion.div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRollClick}
              style={{
                padding: "16px 40px",
                fontSize: "18px",
                borderRadius: "50px",
                border: "none",
                backgroundColor: "#fff",
                color: "#000",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              }}
            >
              Jogar Dados
            </motion.button>
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={pularVez}
              style={{
                padding: "16px 40px",
                fontSize: "18px",
                borderRadius: "50px",
                border: "none",
                backgroundColor: "#fff",
                color: "#000",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              }}
            >
              Passar a vez
            </motion.button>
          </motion.div>
        )}

        {/* BOTÃO SAIR DA PRISÃO (Só aparece se ESTIVER preso) */}
        {playerObject.preso && fase === "IDLE" && !isProcessing && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={tentarSoltar} // <--- Ação vinculada
            style={{
              padding: "16px 40px",
              fontSize: "18px",
              borderRadius: "50px",
              border: "none",
              backgroundColor: "#fff",
              color: "#000",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            }}
          >
            Tentar sair da prisão (Dados)
          </motion.button>
        )}

        {/* RESULTADO FINAL */}
        {fase === "FINAL" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: "36px",
              fontWeight: "800",
              color: "white",
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            }}
          >
            Total: {serverTotal || dado1 + dado2}
          </motion.div>
        )}
      </div>
    </div>
  );
};