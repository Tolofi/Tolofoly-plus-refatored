import { motion } from "framer-motion";

export const ExoticProperties = ({ propriedade, msg }) => {
const isStart = propriedade.color === "Comeco";
  const isPrison = propriedade.color === "Prisao";
  const isGuest = propriedade.color === "Visitante";
  const isPark = propriedade.color === "Estacionamento";
  const isLucky = propriedade.color === "Sorte";
  const isTax = propriedade.color === "Taxa";

  
  return (
    <motion.div
      // A KEY FICA NO ELEMENTO RAIZ (ID ou Name)
      key={propriedade.id || propriedade.name}
      className="nu-card"
      // ANIMAÇÃO DO CARD INTEIRO
      initial={{ x: "-100vh" }}
      animate={{ x: 0 }}
      exit={{ x: "100vh" }}
      transition={{ ease: "easeInOut", duration: 0.5 }}
    >
      <div className="nu-card">
        {/* HEADER */}
        <div
          className="nu-header"
          style={{
            backgroundColor: `${propriedade.themeColor}`,
            color: "white",
          }}
        >
          <div className="nu-tag-container"></div>
          <h2 className="nu-title">{propriedade.name}</h2>
        </div>
        <div className="special-card-content">
          <div className="special-card-svg">
            {isStart && <span className="SvgSub">Você está no começo.</span>}
            {isPrison && <span className="SvgSub">Você está preso.</span>}
            {isGuest && <span className="SvgSub">Visitando um preso.</span>}
            {isPark && <span className="SvgSub">Achou sua vaga?</span>}
            {isLucky && (
              <span className="SvgSub">
                {msg ? "" : "Que nome mais estranho para uma via."}
              </span>
            )}
            {isTax && (
                <span className="SvgSub">
                Faz o L.
              </span>
            )}
          </div>
          <div className="special-card-text">
            {isPrison && (
              <span>
                Mas estamos fazendo de tudo com os advogados para te tirar daí o
                mais rápido possível
              </span>
            )}
            {isGuest && (
              <span>Fique tranquilo, o horário de visita já vai começar</span>
            )}
            {isPark && (
              <span>
                Fique tranquilo, uma rodada no estacionamento é grátis. Por
                enquanto...
              </span>
            )}
            {isLucky && <span>{msg ? msg : "Que nome mais estranho para uma via."}</span>}
            {isTax && <span>Vou te ajudar a tirar o escorpião do bolso, então já me passa {propriedade.taxAmount === 1000 ? "milzão" : "duas mil doletas"}.</span>}
            {isStart && <span>Respire um pouco e aproveite para refletir... Já tava esquecendo, toma seus dois mil!</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
