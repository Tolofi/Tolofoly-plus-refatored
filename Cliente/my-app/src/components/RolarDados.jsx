import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DadoUnitario } from "./DadoUnitario";
import { splitTotalIntoTwoDice } from "../diceLogic";

export const RolarDados = ({ click, serverTotal, onComplete }) => {
  const [fase, setFase] = useState("IDLE"); // IDLE, WAITING_SERVER, SHOW_D1, ROLLING_D2, FINAL
  const [dado1, setDado1] = useState(1);
  const [dado2, setDado2] = useState(1);

  // 1. Usuário clica em JOGAR
  const handleRollClick = () => {
    setFase("WAITING_SERVER"); // Começa a agitar o dado 1 no centro
    click(); // Chama o socket para pedir o número
  };

  // 2. O Servidor responde (serverTotal muda de 0 para algo, ex: 7)
  useEffect(() => {
    // Garante que só roda se o serverTotal chegou E se ainda estamos esperando
    if (serverTotal > 0 && fase === "WAITING_SERVER") {
      const [v1, v2] = splitTotalIntoTwoDice(serverTotal);
      setDado1(v1);
      setDado2(v2);

      // --- CORREÇÃO AQUI ---
      // Mesmo se o servidor responder na hora, esperamos 1.5 segundos
      // vendo o dado 1 girar antes de mostrar o resultado.
      setTimeout(() => {
        playAnimationSequence();
      }, 1500);
    }
  }, [serverTotal, fase]);

  const playAnimationSequence = () => {
    // Passo 1: Para o Dado 1 e mostra o valor (Ele ainda está no centro)
    // Ao mudar a fase, o DadoUnitario recebe agitado={false} e mostra o número fixo
    setFase("SHOW_D1");

    // Passo 2: Após um tempinho apreciando o primeiro dado, ele sobe
    setTimeout(() => {
      setFase("ROLLING_D2");

      // Passo 3: Dado 2 para, mostra valor, e ambos vão para o lado a lado
      setTimeout(() => {
        setFase("FINAL");

        // Avisa a MainPage para fechar tudo depois de um tempinho
        setTimeout(onComplete, 2500);
      }, 1500);
    }, 1000); // 1 segundo parado no D1 antes de chamar o D2
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(8px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          position: "relative",
          height: "200px",
          width: "300px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* DADO 1 */}
        <motion.div
          initial={{ y: 0, x: 0 }}
          animate={{
            // Coreografia:
            // WAITING/SHOW: Centro (0,0)
            // ROLLING_D2: Sobe (-70px) para dar espaço ao D2
            // FINAL: Volta a altura normal (y:0) mas vai para Esquerda (x: -45)
            y: fase === "ROLLING_D2" ? -70 : 0,
            x: fase === "FINAL" ? -45 : 0,
          }}
          transition={{ type: "spring", stiffness: 150, damping: 18 }}
          style={{ position: "absolute", zIndex: 10 }}
        >
          {/* Ele agita enquanto espera o servidor */}
          <DadoUnitario valor={dado1} agitado={fase === "WAITING_SERVER"} />
        </motion.div>

        {/* DADO 2: Só aparece na fase 2 */}
        <AnimatePresence>
          {(fase === "ROLLING_D2" || fase === "FINAL") && (
            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.5, x: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                // Coreografia:
                // ROLLING: Aparece embaixo (y: 60)
                // FINAL: Sobe pro centro (y: 0) e vai para Direita (x: 45)
                y: fase === "FINAL" ? 0 : 60,
                x: fase === "FINAL" ? 45 : 0,
              }}
              style={{ position: "absolute", zIndex: 10 }}
            >
              {/* Ele agita enquanto estamos na fase ROLLING_D2 */}
              <DadoUnitario valor={dado2} agitado={fase === "ROLLING_D2"} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BOTÃO JOGAR (Só aparece no início) */}
      {fase === "IDLE" && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={handleRollClick}
          style={{
            padding: "16px 40px",
            fontSize: "18px",
            borderRadius: "50px",
            border: "none",
            background: "#fff",
            color: "#1f2937",
            fontWeight: "bold",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            cursor: "pointer",
            marginTop: "80px",
          }}
        >
          Jogar Dados
        </motion.button>
      )}

      {/* TEXTO DE TOTAL (Só no final) */}
      {fase === "FINAL" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: "120px",
            fontSize: "32px",
            fontWeight: "800",
            color: "white",
          }}
        >
          Total: {serverTotal}
        </motion.div>
      )}
    </div>
  );
};
