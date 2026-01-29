import { useEffect, useState, useRef } from "react";
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
import { ConfirmationModal } from "../components/ConfirmationModal";
import { Card } from "../components/Card";
import { FloatingReceipt } from "../components/Recibo";

export const MainPage = () => {
  const navigate = useNavigate();

  // 1. Buscando dados do Zustand
  const isMyTurn = useGameStore((state) => state.isMyTurn);

  // Extrai os valores dos hooks separadamente (sempre executa os hooks)
  const storeUsername = useGameStore((state) => state.username);
  const objectUsername = useGameStore((state) => state.meAsObject?.username);

  // Aplica a lógica de prioridade depois
  const username =
    storeUsername ||
    objectUsername ||
    localStorage.getItem("monopoly_username");

  const playerObject = useGameStore((state) => state.meAsObject);
  const saldo = useGameStore((state) => state.meAsObject?.saldo || 0);
  const turnPhase = useGameStore((state) => state.turnPhase);

  // 2. Estados Locais
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState(0);
  const [transferTarget, setTransferTarget] = useState("");
  const [allPlayersList, setAllPlayersList] = useState([]);
  const [isDiceRequired, setIsDiceRequired] = useState(false);

  // useRef para manter o valor atualizado dentro do Socket
  const transferTargetRef = useRef("");

  useEffect(() => {
    transferTargetRef.current = transferTarget;
  }, [transferTarget]);

  // Animações e Notificações
  const [paymentAnimation, setPaymentAnimation] = useState(null);
  const [bankAnimation, setBankAnimation] = useState(null);
  const [notification, setNotification] = useState("");
  const [luckyMessage, setLuckyMessage] = useState(false);
  const [isMessageRead, setIsMessageRead] = useState(true);

  // Modais e Controles
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalVariant, setModalVariant] = useState("");
  const [modalQtd, setModalQtd] = useState(0);
  const [isMagicBoxOpen, setIsMagicBoxOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [cardShow, setCardShow] = useState({
    status: false,
    valor: null,
    destinatario: null,
    remetente: null,
  });
  const [reciboShow, setReciboShow] = useState({
    status: false,
    valor: null,
    destinatario: null,
    remetente: null,
  });

  const [isConfirmationModalOpened, setIsConfirmationModalOpened] =
    useState(false);
  const [confirmationActionType, setConfirmationActionType] = useState("");
  const [isMove, setIsMove] = useState(false);

  const [isRegisterFail, setIsRegisterFail] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [propertyToSell, setPropertyToSell] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fakeDice, setFakeDice] = useState(null);

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

  // --- FUNÇÕES GERAIS ---

  function openMagicBoxModal(variant) {
    if (variant === "transfer") {
      setTransferTarget("");
      setIsTransferOpen(true);
      setIsMagicBoxOpen(false);
      return;
    }
    if (variant === "move") {
      setIsMove(true);
    }
    setModalVariant(variant);
    setIsModalOpen(true);
  }

  function tentarSoltar() {
    setIsProcessing(true);
    const d1 = rolarUmDado();
    const d2 = rolarUmDado();
    setFakeDice({ d1, d2 });
    setIsDiceRequired(true);
  }

  function finalizarTentativa() {
    setIsDiceRequired(false);
    if (fakeDice) {
      socket.emit("tentativaPrisao", { d1: fakeDice.d1, d2: fakeDice.d2 });
    }
  }

  function rollFakeDices(dices) {
    if (!dices) {
      setFakeDice({ d1: rolarUmDado(), d2: rolarUmDado() });
    }
    if (dices) {
      setFakeDice({ d1: dices.d1, d2: dices.d2 });
    }
    setIsDiceRequired(true);
    setTimeout(() => {
      setIsDiceRequired(false);
    }, 5000);
  }

  function closeAndSendModal(isForward) {
    setIsProcessing(true);

    // CORREÇÃO: Forçar conversão para Inteiro
    const quantidade = parseInt(modalQtd, 10);

    if (modalVariant === "move") {
      // Usa a variável convertida 'quantidade'
      quantidade % 5 === 0 ? setIsMessageRead(false) : setIsMessageRead(true);

      if (isForward === true) {
        socket.emit("moveByPlayer", quantidade);
      } else {
        socket.emit("moveByPlayer", quantidade * -1);
      }
    } else if (modalVariant === "removeMoney") {
      // Usa a variável convertida 'quantidade'
      socket.emit("bankPayment", quantidade);
    } else if (modalVariant === "getMoney") {
      bankMoneyRequest();
    }

    setIsModalOpen(false);
    setIsMagicBoxOpen(false);
    setModalQtd(0);
    setIsMove(false);
  }

  function handleTransfer() {
    setIsProcessing(true);
    socket.emit("playerTransaction", transferTarget, transferAmount);
    setIsTransferOpen(false);
    setTransferAmount(0);
    setIsMagicBoxOpen(false);
  }

  function bankMoneyRequest() {
    // CORREÇÃO: Forçar conversão para Número aqui também
    const valorReal = Number(modalQtd);

    socket.emit("getMoneyByPlayer", valorReal);
    setReciboShow({
      status: true,
      valor: valorReal,
      destinatario: username,
      remetente: "Banco",
    });
  }

  function handlePassTurn() {
    socket.emit("finishTurn");
    useGameStore.getState().setIsMyTurn(false);
    useGameStore.getState().setTurnPhase("WAITING");
    setIsProcessing(false);
    setIsMessageRead(true);
  }

  function openConfirmationModal(type) {
    setConfirmationActionType(type);
    setIsConfirmationModalOpened(true);
  }

  function handleConfirmationDecision(status) {
    if (status) {
      if (confirmationActionType === "finish") {
        handlePassTurn();
      }
      if (confirmationActionType === "leave") {
        socket.emit("leaveGame");
        localStorage.removeItem("monopoly_username");
        navigate("/");
      }
    }
    setIsConfirmationModalOpened(false);
    setConfirmationActionType("");
  }

  function rolarDados() {
    if (isProcessing) return;
    setIsProcessing(true);
    socket.emit("rollDice");
  }

  function rolarUmDado() {
    return Math.floor(Math.random() * 6) + 1;
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
      socket.emit("reconnectPlayer", savedUsername);
    } else {
      socket.emit("sync_game", username);
    }

    const unlockUI = () => {
      setIsProcessing(false);
    };

    function onDisconnect() {
      setIsConnected(false);
      unlockUI();
    }

    function onConnectError() {
      setIsConnected(false);
      unlockUI();
    }

    function onConnect() {
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
        if (!store.isMyTurn) {
          store.setIsMyTurn(true);
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
      if (data?.autoFinish) {
        setTimeout(() => {
          handlePassTurn();
        }, 3000);
      }
    }

    function onRegisterFail() {
      setIsRegisterFail(true);
      localStorage.removeItem("monopoly_username");
      unlockUI();
    }

    function onLeilaoGanho(data) {
      setReciboShow({
        status: true,
        valor: data,
        destinatario: "Leilão",
        remetente: username,
      });
    }

    function onReconnectSuccess(playerData) {
      setIsConnected(true);
      useGameStore.getState().setMeAsObject(playerData);

      // CORREÇÃO: Mudar de setUsername para setNome
      if (useGameStore.getState().setNome) {
        useGameStore.getState().setNome(playerData.username);
      }

      localStorage.setItem("monopoly_username", playerData.username);
      socket.emit("sync_game", username);
      unlockUI();
    }

    function onRentPaid() {
      setIsProcessing(false);
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
        ? setReciboShow({
            status: true,
            valor: 2000,
            destinatario: username,
            remetente: "Banco",
          })
        : onNotification(data.message);
    }

    function onPlayerUpdate(playerData) {
      useGameStore.getState().setMeAsObject(playerData);
    }

    function onBankPaymentResult(data) {
      unlockUI();
      const currentUser =
        useGameStore.getState().username ||
        localStorage.getItem("monopoly_username");

      if (data.status) {
        setCardShow({
          status: true,
          remetente: currentUser,
          destinatario: "Banco",
          valor: data.valor,
        });
      } else {
        onNotification(data.message);
      }
    }

    function onBuyPropertyResult(data) {
      unlockUI();
      const storeState = useGameStore.getState();
      const propAtual = storeState.currentProperty;
      const currentUser =
        storeState.username || localStorage.getItem("monopoly_username");

      if (data.status === true) {
        setCardShow({
          status: true,
          remetente: currentUser,
          destinatario: "Banco",
          valor: propAtual.preco || propAtual.price,
        });
      }
    }

    function onShowReceipt(data) {
      setReciboShow({
        status: true,
        destinatario: data.destinatario,
        valor: data.valor,
      });
    }

    function onSoldToBank(data) {
      unlockUI();
      if (!data) return;
      setReciboShow({
        status: true,
        valor: data.valor,
        destinatario: username,
        remetente: "Banco",
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

    // --- CORREÇÃO AQUI: PASSANDO DADOS VIA STATE ---
    function onLeilaoAnuncio(data) {
      navigate("/leilao", { state: data });
    }

    function onDiceRolled(data) {
      unlockUI();
      setIsMessageRead(true);
      useGameStore.getState().setDice(data);
    }

    function onCurrentRoundData(data) {
      console.log("onCurrentRoundData recebido:", data);
      useGameStore.getState().setCurrentProperty(data.propriedade);
    }

    function onAiMessage(data) {
      // ADICIONE ESTA LINHA: Libera a interface após receber a carta
      setIsProcessing(false);

      data && setIsMessageRead(false);
      data ? setLuckyMessage(data) : setLuckyMessage("Algo deu errado.");
    }

    function onPlayerTransactionResult(data) {
      unlockUI();
      const currentUser =
        useGameStore.getState().username ||
        localStorage.getItem("monopoly_username");

      if (data && data.status) {
        const valorTransacao = data.msgDe[1];
        setCardShow({
          status: true,
          remetente: currentUser,
          destinatario: data.msgDe[0] || "Jogador",
          valor: valorTransacao,
        });
      }
    }

    function onTransactionReceipt(data) {
      setReciboShow({
        status: true,
        valor: data.valor,
        destinatario: data.destinatario || "Banco",
        remetente: data.remetente,
      });
    }

    function onPropertiesUpdate(todasPropriedades) {
      const store = useGameStore.getState();
      if (store.updateProperties) {
        store.updateProperties(todasPropriedades);
      }
      const idDaPropAtual = store.currentProperty?.id;
      if (idDaPropAtual !== undefined) {
        const propAtualizada = todasPropriedades.find(
          (p) => p.id === idDaPropAtual,
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
    socket.off("leilaoGanho");
    socket.off("leilaoAnuncio");
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
    socket.off("playerTransactionResult");
    socket.off("Jailled");
    socket.off("propertyTransactionResult");
    socket.off("transactionReceipt");
    socket.off("rentPaidSuccess");

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("leilaoGanho", onLeilaoGanho);
    socket.on("leilaoAnuncio", onLeilaoAnuncio);
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
    socket.on("playerTransactionResult", onPlayerTransactionResult);
    socket.on("Jailled", onJailled);
    socket.on("propertyTransactionResult", onGenericUnlock);
    socket.on("transactionReceipt", onTransactionReceipt);
    socket.on("rentPaidSuccess", onRentPaid);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("leilaoGanho", onLeilaoGanho);
      socket.off("leilaoAnuncio", onLeilaoAnuncio);
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
      socket.off("transactionReceipt", onTransactionReceipt);
      socket.off("soldToBank", onSoldToBank);
      socket.off("propertiesUpdate", onPropertiesUpdate);
      socket.off("buyPropertyResult", onBuyPropertyResult);
      socket.off("diceRolled", onDiceRolled);
      socket.off("yourTurn", onYourTurn);
      socket.off("currentRoundData", onCurrentRoundData);
      socket.off("turn_update", onTurnUpdate);
      socket.off("aiMessage", onAiMessage);
      socket.off("playerTransactionResult", onPlayerTransactionResult);
      socket.off("Jailled", onJailled);
      socket.off("propertyTransactionResult", onGenericUnlock);
      socket.off("rentPaidSuccess", onRentPaid);
    };
  }, []);

  const showFailModal = isRegisterFail || !isConnected;

  // --- PROTEÇÃO DE CARREGAMENTO PARA EVITAR TELA BRANCA ---
  if (!playerObject) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#111827",
          color: "#ffffff",
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ loop: Infinity, duration: 1 }}
          style={{
            borderTop: "2px solid #fbbf24",
            borderRadius: "50%",
            width: 40,
            height: 40,
          }}
        />
        <span style={{ marginLeft: 15 }}>Sincronizando Jogo...</span>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {cardShow.status && (
          <Card
            onThrow={() => {
              console.log("chamar animação no tabuleiro");
              setCardShow((prev) => ({ ...prev, status: false }));
              socket.emit("cardThrowed", {
                valor: cardShow.valor,
                remetente: cardShow.remetente,
                destinatario: cardShow.destinatario,
              });
            }}
            playerName={username}
            balance={saldo}
          />
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {reciboShow.status && (
          <FloatingReceipt
            valor={reciboShow.valor}
            destinatario={reciboShow.destinatario}
            remetente={reciboShow.remetente}
            onFinish={() =>
              setReciboShow((prev) => ({ ...prev, status: false }))
            }
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isHistoryOpen && (
          <HistoryModal
            close={() => setIsHistoryOpen(false)}
            actions={history}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isConfirmationModalOpened && (
          <ConfirmationModal
            close={() => setIsConfirmationModalOpened(false)}
            act={handleConfirmationDecision}
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
            onSell={(prop) => {
              setPropertyToSell(prop);
              setIsPropertiesOpen(false);
            }}
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
            isMove={isMove}
            close={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
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
            type="transfer"
            isBank={true}
            onComplete={() => setBankAnimation(null)}
          />
        )}
      </AnimatePresence>

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
                      msg={isMessageRead ? false : luckyMessage}
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
                      passTurn={() => openConfirmationModal("finish")}
                      onAction={() => setIsProcessing(true)}
                    />
                  </motion.div>
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
                {/* SAFE ACCESS COM ?. */}
                {playerObject?.preso
                  ? `🔒 Você está Detido (${playerObject?.turnosPrisao || 0}/3)`
                  : "Aguardando sua vez..."}
              </div>

              <div className="waiting-message">
                {!playerObject?.preso && waitingMessage[waitingMessageIndex]}
                {playerObject?.preso && prisonMessage[prisonMessageIndex]}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isDiceRequired ? (
            <RolarDados
              key="fake-dice"
              d1={fakeDice?.d1}
              d2={fakeDice?.d2}
              serverTotal={0}
              onComplete={finalizarTentativa}
            />
          ) : (
            turnPhase === "ROLLING" && (
              <RolarDados
                key="real-dice"
                click={rolarDados}
                serverTotal={dice}
                pularVez={handlePassTurn}
                onComplete={handleDiceComplete}
                tentarSoltar={tentarSoltar}
                isProcessing={isProcessing}
              />
            )
          )}

          {isMagicBoxOpen && (
            <MagicBox
              key="magic-box"
              open={openMagicBoxModal}
              close={() => setIsMagicBoxOpen(false)}
              dices={rollFakeDices}
              onLeave={() => openConfirmationModal("leave")}
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
                  zIndex: 9998,
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
                  zIndex: 9999,
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
