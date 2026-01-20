import { motion } from "framer-motion";
import { useGameStore } from "../store";
import { frasesEstacionamento, frasesImpostoRenda, frasesTaxaRiqueza } from "../FrasesEsperaCartasSorte";

export const ExoticProperties = ({ propriedade, msg }) => {
const isStart = propriedade.color === "Comeco";
  const isPrison = propriedade.color === "Prisao";
  const isGuest = propriedade.color === "Visitante";
  const isPark = propriedade.color === "Estacionamento";
  const isLucky = propriedade.color === "Sorte";
  const isTax = propriedade.color === "Taxa";
  const isRiqueza = propriedade.name === "Taxa De Riqueza";
  const isImposto = propriedade.name === "Imposto de Renda";
  const playerObject = useGameStore((state) => state.meAsObject);
  const parkMessage = frasesEstacionamento;
  const parkMessageIndex = Math.floor(Math.random() * frasesEstacionamento.length);
  const riquezaMessage = frasesTaxaRiqueza;
  const riquezaMessageIndex = Math.floor(Math.random() * frasesTaxaRiqueza.length);
  const impostoMessage = frasesImpostoRenda;
  const impostoMessageIndex = Math.floor(Math.random() * frasesImpostoRenda.length);
  
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
            {isGuest && <span className="SvgSub">{playerObject.preso ? "Foi preso" : "Visitando um preso"}</span>}
            {isPark && <span className="SvgSub"></span>}
            {isLucky && (
              <span className="SvgSub">
                {msg ? "" : "Que nome mais estranho para uma via."}
              </span>
            )}
            {isTax && (
                <span className="SvgSub">
                {isRiqueza}
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
              <span>{playerObject.preso ? "Eu não queria ser você" : "O horário de visita já vai começar"}</span>
            )}
            {isPark && (
              <span>
                {parkMessage[parkMessageIndex]}
              </span>
            )}
            {isLucky && <span>{msg ? msg : "Aperta logo esse botão e vamo ver se você tem sorte."}</span>}
            {isTax && <span>{isRiqueza && riquezaMessage[riquezaMessageIndex]}{isImposto && impostoMessage[impostoMessageIndex]}</span>}
            {isStart && <span>Respire um pouco e aproveite para refletir... Já tava esquecendo, toma seus dois mil!</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
