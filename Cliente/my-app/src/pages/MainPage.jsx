import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store";
import { socket } from "../../socket";
import { getAvailableActions } from "../buttonDecider";
import { CurrentProperty } from "../components/X_CurrentProperty";
import { ActionButtons } from "../components/ActionButtons";
import { TopBar } from "../components/TopBar";
import { RolarDados } from "../components/RolarDados";
import { TransactionMachine } from "../components/PaymentSuccessAnimation";
import { DownBar } from "../components/DownBar";
import { frasesDeEspera, frasesPrisao } from "../FrasesEsperaCartasSorte";
import { MagicBoxModal } from "../components/MagicBoxModal";
import { MagicBox } from "../components/MagicBox";
import { TransferModal } from "../components/TransferModal";
import { HistoryModal } from "../components/HistoryModal";
import { PropertiesModal } from "../components/PropertiesModal";
import { SellPropertyModal } from "../components/SellPropertyModal";

export const MainPage = () => {
  const navigate = useNavigate();

  // 1. Buscando dados do Zustand
  const isMyTurn = useGameStore((state) => state.isMyTurn);
  const username = useGameStore((state) => state.username);
  const playerObject = useGameStore((state) => state.meAsObject);
  const saldo = useGameStore((state) => state.meAsObject?.saldo || 0);
  const turnPhase = useGameStore((state) => state.turnPhase);

  // 2. Estados Locais
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState(0);
  const [transferTarget, setTransferTarget] = useState("");
  const [allPlayersList, setAllPlayersList] = useState([]);

  // Animações e Notificações
  const [paymentAnimation, setPaymentAnimation] = useState(null);
  const [bankAnimation, setBankAnimation] = useState(null);
  const [notification, setNotification] = useState("");
  const [luckyMessage, setLuckyMessage] = useState(false);

  // Modais e Controles
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalVariant, setModalVariant] = useState("");
  const [modalQtd, setModalQtd] = useState(0);
  const [isMagicBoxOpen, setIsMagicBoxOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // ESTADOS DE ERRO E CONEXÃO
  const [isRegisterFail, setIsRegisterFail] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [propertyToSell, setPropertyToSell] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 3. Lógica Derivada
  const currentProperty = useGameStore((state) => state.currentProperty);
  const dice = useGameStore((state) => state.dice);
  const propriedade = useGameStore((state) => state.currentProperty) || {};
  const actions = getAvailableActions(propriedade, username, isMyTurn);

  const history = useGameStore((state) => state.history);
  const waitingMessage = frasesDeEspera;
  const waitingMessageIndex = Math.floor(Math.random() * frasesDeEspera.length);
  const prisonMessage = frasesPrisao;
  const prisonMessageIndex = Math.floor(Math.random() * frasesPrisao.length);
  const availablePlayers = allPlayersList.filter((name) => name !== username);

  // --- FUNÇÕES ---

  function openMagicBoxModal(variant) {
    if (variant === "transfer") {
      setIsTransferOpen(true);
      setIsMagicBoxOpen(false);
      return;
    }
    setModalVariant(variant);
    setIsModalOpen(true);
  }

  function closeAndSendModal() {
    setIsProcessing(true);
    modalVariant === "move" && socket.emit("moveByPlayer", modalQtd);
    modalVariant === "getMoney" && socket.emit("getMoneyByPlayer", modalQtd);
    setIsModalOpen(false);
    setIsMagicBoxOpen(false);
    setModalQtd(0);
  }

  function handleTransfer() {
    console.log(`Enviando ${transferAmount} para ${transferTarget}`);
    setIsProcessing(true);
    socket.emit("playerTransaction", transferTarget, transferAmount);
    setIsTransferOpen(false);
    setTransferAmount(0);
    setTransferTarget("");
    setIsMagicBoxOpen(false);
  }

  function finishTurn() {
    socket.emit("finishTurn");
    useGameStore.getState().setIsMyTurn(false);
    useGameStore.getState().setTurnPhase("WAITING");
    setIsProcessing(false);
  }

  function rolarDados() {
    if (isProcessing) return;
    setIsProcessing(true);
    socket.emit("rollDice");
  }

  function teste() {
    socket.emit("testDice");
  }

  const handleDiceComplete = () => {
    useGameStore.getState().setTurnPhase("DECIDING");
  };

  // --- SOCKET LISTENERS ---
  useEffect(() => {
    socket.connect();

    const initialStateUsername = useGameStore.getState().username;
    if (initialStateUsername) {
      localStorage.setItem("monopoly_username", initialStateUsername);
    }

    const savedUsername = localStorage.getItem("monopoly_username");
    if (savedUsername && !initialStateUsername) {
      console.log("🔄 Tentando reconectar usuário:", savedUsername);
      socket.emit("reconnectPlayer", savedUsername);
    } else {
      socket.emit("sync_game");
    }

    const unlockUI = () => {
      setIsProcessing(false);
    };

    // --- HANDLERS ---

    // 1. MONITOR DE CONEXÃO
    function onDisconnect() {
      console.warn("⚠️ Desconectado do servidor!");
      setIsConnected(false);
      unlockUI();
    }

    function onConnectError() {
      console.warn("⚠️ Erro de conexão (Servidor offline?)");
      setIsConnected(false);
      unlockUI();
    }

    function onConnect() {
      console.log("🟢 Conectado ao servidor!");
      setIsConnected(true);
      const savedUser = localStorage.getItem("monopoly_username");
      if (savedUser) socket.emit("reconnectPlayer", savedUser);
    }

    function onTurnUpdate(data) {
      const store = useGameStore.getState();
      const currentUser =
        store.username ||
        store.meAsObject?.username ||
        localStorage.getItem("monopoly_username");
      const souEu = data.playerDaVez === currentUser;

      setIsProcessing(false);

      if (!souEu) {
        store.setTurnPhase("WAITING");
        store.setIsMyTurn(false);
      } else {
        // --- CORREÇÃO DO RESET DE TURNO ---
        // Só atualizamos o estado SE nós achávamos que não era a nossa vez.
        // Se isMyTurn já for true, significa que já estamos a jogar (talvez em DECIDING),
        // então NÃO tocamos em nada para evitar resetar para ROLLING.
        if (!store.isMyTurn) {
          store.setIsMyTurn(true);
          // Se entramos no turno agora, aí sim vamos para ROLLING
          if (store.turnPhase === "WAITING") {
            store.setTurnPhase("ROLLING");
          }
        }
      }
    }

    function onYourTurn(data) {
      const store = useGameStore.getState();
      store.setIsMyTurn(true);
      setIsProcessing(false);

      // Esse evento é específico e seguro, vindo do backend com o estado real do dado
      if (data && data.hasRolled) {
        store.setDice(data.lastValue || 0);
        store.setTurnPhase("DECIDING");
      } else {
        store.setDice(0);
        store.setTurnPhase("ROLLING");
      }
    }

    function onJailled(data) {
      const msg = data?.message || "Você continua preso.";
      onNotification(msg);
      console.log("Você esta preso.")
      // 1. NÃO mude para 'DECIDING'. Isso evitará que os botões apareçam.
      // Mantenha o estado atual ou mude para algo bloqueado se tiver.

      // 2. Aguarda 3 segundos para o jogador ler a mensagem e ver o dado
      setTimeout(() => {
        finishTurn(); // Encerra o turno automaticamente
      }, 3000);
    }

    function onRegisterFail() {
      setIsRegisterFail(true);
      localStorage.removeItem("monopoly_username");
      unlockUI();
    }

    function onReconnectSuccess(playerData) {
      setIsConnected(true);
      useGameStore.getState().setMeAsObject(playerData);
      if (useGameStore.getState().setUsername) {
        useGameStore.getState().setUsername(playerData.username);
      }
      localStorage.setItem("monopoly_username", playerData.username);
      socket.emit("sync_game");
      unlockUI();
    }

    function onRegisterSuccess() {
      const currentName = useGameStore.getState().username;
      if (currentName) {
        localStorage.setItem("monopoly_username", currentName);
      }
      unlockUI();
    }

    function onUpdatePlayersList(listaDeNomes) {
      if (Array.isArray(listaDeNomes)) {
        setAllPlayersList(listaDeNomes);
      }
    }

    function onHistoryIncrement(data) {
      useGameStore.getState().addHistoryItem(data);
    }

    function onBegginingPoint(data) {
      data.status
        ? setBankAnimation({ source: `Ponto de Partida`, value: 2000 })
        : onNotification(data.message);
    }

    function onPlayerUpdate(playerData) {
      useGameStore.getState().setMeAsObject(playerData);
    }

    function onBankPaymentResult(data) {
      unlockUI();
      data.status
        ? setPaymentAnimation({ name: "Banco", price: data.valor })
        : onNotification(data.message);
    }

    function onBuyPropertyResult(data) {
      unlockUI();
      const storeState = useGameStore.getState();
      const propAtual = storeState.currentProperty;
      if (data.status === true)
        setPaymentAnimation({
          name: propAtual?.name || "Propriedade",
          price: propAtual?.price || 0,
          type: "purchase",
        });
    }

    function onSoldToBank(data) {
      unlockUI();
      if (!data) return;
      setBankAnimation({
        source: `Venda: ${data.propriedade}`,
        value: data.valor,
      });
    }

    function onNotification(data) {
      setNotification(data);
      setTimeout(() => setNotification(""), 4000);
    }

    function onError(msg) {
      setNotification(msg || "Ocorreu um erro");
      setTimeout(() => setNotification(""), 4000);
      unlockUI();
    }

    function onDiceRolled(data) {
      unlockUI();
      useGameStore.getState().setDice(data);
    }

    function onCurrentRoundData(data) {
      useGameStore.getState().setCurrentProperty(data.propriedade);
    }

    function onAiMessage(data) {
      data ? setLuckyMessage(data) : setLuckyMessage("Algo deu errado.");
    }

    function onPlayerTrasactionResult(data) {
      unlockUI();
      if (data && data.status) {
        setPaymentAnimation({
          name: data.msgDe[0],
          price: data.msgDe[1],
          type: "transfer",
        });
      }
    }

    function onPropertiesUpdate(todasPropriedades) {
      const store = useGameStore.getState();
      if (store.updateProperties) {
        store.updateProperties(todasPropriedades);
      }
      const idDaPropAtual = store.currentProperty?.id;
      if (idDaPropAtual !== undefined) {
        const propAtualizada = todasPropriedades.find(
          (p) => p.id === idDaPropAtual
        );
        if (propAtualizada) {
          store.setCurrentProperty(propAtualizada);
        }
      }
      unlockUI();
    }

    function onGenericUnlock() {
      unlockUI();
    }

    // --- LIGA/DESLIGA LISTENERS ---

    socket.off("connect");
    socket.off("disconnect");
    socket.off("connect_error");
    socket.off("reconnectSuccess");
    socket.off("registerSuccess");
    socket.off("registerFail");
    socket.off("historyIncrement");
    socket.off("allPlayersUpdate");
    socket.off("begginingPoint");
    socket.off("bankPaymentResult");
    socket.off("aiMessage");
    socket.off("playerUpdate");
    socket.off("notification");
    socket.off("error");
    socket.off("soldToBank");
    socket.off("propertiesUpdate");
    socket.off("buyPropertyResult");
    socket.off("diceRolled");
    socket.off("yourTurn");
    socket.off("currentRoundData");
    socket.off("turn_update");
    socket.off("playerTrasactionResult");
    socket.off("Jailled");
    socket.off("propertyTransactionResult");

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("reconnectSuccess", onReconnectSuccess);
    socket.on("registerSuccess", onRegisterSuccess);
    socket.on("registerFail", onRegisterFail);
    socket.on("historyIncrement", onHistoryIncrement);
    socket.on("allPlayersUpdate", onUpdatePlayersList);
    socket.on("begginingPoint", onBegginingPoint);
    socket.on("bankPaymentResult", onBankPaymentResult);
    socket.on("aiMessage", onAiMessage);
    socket.on("playerUpdate", onPlayerUpdate);
    socket.on("notification", onNotification);
    socket.on("error", onError);
    socket.on("soldToBank", onSoldToBank);
    socket.on("propertiesUpdate", onPropertiesUpdate);
    socket.on("buyPropertyResult", onBuyPropertyResult);
    socket.on("diceRolled", onDiceRolled);
    socket.on("yourTurn", onYourTurn);
    socket.on("currentRoundData", onCurrentRoundData);
    socket.on("turn_update", onTurnUpdate);
    socket.on("playerTrasactionResult", onPlayerTrasactionResult);
    socket.on("Jailled", onJailled);
    socket.on("propertyTransactionResult", onGenericUnlock);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("reconnectSuccess", onReconnectSuccess);
      socket.off("registerSuccess", onRegisterSuccess);
      socket.off("registerFail");
      socket.off("historyIncrement", onHistoryIncrement);
      socket.off("allPlayersUpdate", onUpdatePlayersList);
      socket.off("begginingPoint", onBegginingPoint);
      socket.off("bankPaymentResult", onBankPaymentResult);
      socket.off("playerUpdate", onPlayerUpdate);
      socket.off("notification", onNotification);
      socket.off("error", onError);
      socket.off("soldToBank", onSoldToBank);
      socket.off("propertiesUpdate", onPropertiesUpdate);
      socket.off("buyPropertyResult", onBuyPropertyResult);
      socket.off("diceRolled", onDiceRolled);
      socket.off("yourTurn", onYourTurn);
      socket.off("currentRoundData", onCurrentRoundData);
      socket.off("turn_update", onTurnUpdate);
      socket.off("aiMessage", onAiMessage);
      socket.off("playerTrasactionResult", onPlayerTrasactionResult);
      socket.off("Jailled", onJailled);
      socket.off("propertyTransactionResult", onGenericUnlock);
    };
  }, []);

  const showFailModal = isRegisterFail || !isConnected;

  return (
    <>
      <AnimatePresence>
        {isHistoryOpen && (
          <HistoryModal
            close={() => setIsHistoryOpen(false)}
            actions={history}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isTransferOpen && (
          <TransferModal
            close={() => setIsTransferOpen(false)}
            confirm={handleTransfer}
            players={availablePlayers}
            selectedPlayer={transferTarget}
            setSelectedPlayer={setTransferTarget}
            amount={transferAmount}
            setAmount={setTransferAmount}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPropertiesOpen && (
          <PropertiesModal
            close={() => setIsPropertiesOpen(false)}
            allPlayers={allPlayersList}
            onSell={(prop) => setPropertyToSell(prop)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {propertyToSell && (
          <SellPropertyModal
            close={() => setPropertyToSell(null)}
            property={propertyToSell}
            allPlayers={allPlayersList}
            myUsername={username}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <MagicBoxModal
            act={closeAndSendModal}
            setQtd={setModalQtd}
            val={modalQtd}
          />
        )}
      </AnimatePresence>

      {paymentAnimation && (
        <TransactionMachine
          destinatario={paymentAnimation.name}
          valor={paymentAnimation.price.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          type={paymentAnimation.type}
          isBank={false}
          onComplete={() => setPaymentAnimation(null)}
        />
      )}

      {bankAnimation && (
        <TransactionMachine
          destinatario={bankAnimation.source}
          valor={bankAnimation.value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          type="transfer" // banco SEMPRE é transferência
          isBank={true}
          onComplete={() => setBankAnimation(null)}
        />
      )}

      <motion.div
        initial={{ x: "100vw" }}
        animate={{ x: 0 }}
        exit={{ x: "-100vw", opacity: 0 }}
        transition={{ ease: "easeInOut", duration: 0.4 }}
        className="main-container"
      >
        <TopBar
          dado={dice}
          dinheiro={saldo}
          propriedade={propriedade}
          notification={notification}
        />

        <DownBar
          onTransferClick={() => setIsTransferOpen(true)}
          onHistoryClick={() => setIsHistoryOpen(true)}
          onPropertiesClick={() => setIsPropertiesOpen(true)}
        />

        <AnimatePresence>
          {isMyTurn ? (
            <motion.div
              key="my-turn-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {turnPhase === "DECIDING" && (
                <motion.div
                  className="tela-propriedade"
                  layout
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 1 } } }}
                  style={{ position: "relative" }}
                >
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, scale: 0.9 },
                      visible: { opacity: 1, scale: 1 },
                    }}
                    className="tela-propriedade-sub"
                    style={{ zIndex: 2, position: "relative" }}
                  >
                    <CurrentProperty
                      propriedade={propriedade}
                      msg={luckyMessage}
                    />
                  </motion.div>

                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: -50 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          type: "spring",
                          stiffness: 200,
                          damping: 20,
                        },
                      },
                    }}
                    style={{
                      zIndex: 1,
                      position: "relative",
                      marginTop: "-10px",
                      opacity: isProcessing ? 0.5 : 1,
                      pointerEvents: isProcessing ? "none" : "auto",
                      filter: isProcessing ? "grayscale(100%)" : "none",
                    }}
                  >
                    <ActionButtons
                      actions={actions}
                      passTurn={finishTurn}
                      onAction={() => setIsProcessing(true)}
                    />
                  </motion.div>

                  {/* {<motion.button
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1 },
                    }}
                    onClick={teste}
                    className="btn-teste"
                  >
                    Testar dice
                  </motion.button>} */}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="turn-waiting"
              className="waiting-turn-div"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="waiting-turn-title">
                {/* Muda o título se estiver preso */}
                {playerObject.preso
                  ? "🔒 Você está Detido"
                  : "Aguardando sua vez..."}
              </div>

              <div className="waiting-message">
                {/* Se NÃO estiver preso, mostra frases aleatórias */}
                {!playerObject.preso && waitingMessage[waitingMessageIndex]}

                {/* Se ESTIVER preso, mostra mensagem fixa */}
                {playerObject.preso && prisonMessage[prisonMessageIndex]}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {turnPhase == "ROLLING" && (
            <RolarDados
              click={rolarDados}
              serverTotal={dice}
              onComplete={handleDiceComplete}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isMagicBoxOpen && (
            <MagicBox
              key="magic-box"
              open={openMagicBoxModal}
              close={() => setIsMagicBoxOpen(false)}
            />
          )}
          {!isMagicBoxOpen && !showFailModal && (
            <motion.button
              key="open-button"
              initial={{ y: 0, opacity: 0, x: "-50%" }}
              animate={{ y: 0, opacity: 1, x: "-50%" }}
              exit={{ y: 50, opacity: 0, x: "-50%" }}
              transition={{ ease: "easeInOut", duration: 0.3 }}
              onClick={() => setIsMagicBoxOpen(true)}
              className="open-magic-box-btn"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 15l-6-6-6 6" />
              </svg>
            </motion.button>
          )}

          {/* --- MODAL DE ERRO DE CONEXÃO --- */}
          {showFailModal && (
            <>
              {/* Overlay Escuro para bloquear tudo */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  zIndex: 9998, // Logo abaixo do modal de erro
                }}
              />

              <motion.div
                key="fail-button"
                initial={{ y: 0, opacity: 0, x: "-50%" }}
                animate={{ y: 0, opacity: 1, x: "-50%" }}
                exit={{ y: 50, opacity: 0, x: "-50%" }}
                transition={{ ease: "easeInOut", duration: 0.3 }}
                className="register-fail-div"
                style={{
                  position: "fixed",
                  bottom: "20px",
                  left: "50%",
                  background: "white",
                  padding: "20px",
                  borderRadius: "15px",
                  boxShadow: "0 4px 25px rgba(0,0,0,0.3)",
                  textAlign: "center",
                  zIndex: 9999, // <--- Z-INDEX INFINITO (ACIMA DE TUDO)
                }}
              >
                <span
                  style={{
                    display: "block",
                    marginBottom: "10px",
                    color: "#1f2937",
                    fontWeight: "600",
                  }}
                >
                  {!isConnected
                    ? "Conexão perdida com o servidor."
                    : "Sessão expirada."}
                </span>
                <button
                  onClick={() => {
                    localStorage.removeItem("monopoly_username");
                    navigate("/");
                  }}
                  style={{
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Voltar ao login
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};
