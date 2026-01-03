import { Memory } from "./Memory";
import { Banco } from "./Banco";
import { Server, Socket } from "socket.io";
import { stringify } from "node:querystring";
import { Carta } from "./CartaSorte";

export class SocketAdmin {
  private io: Server;
  private currentTurnIndex: number = 0;

  constructor(io: Server) {
    this.io = io;
    this.registerEvents();
  }

  // ============================
  // 🔥 EMISSORES CENTRALIZADOS
  // ============================

  private emitPlayerUpdate(username: string) {
    const socketId = Memory.getSocketIdByUsername(username);
    const player = Memory.getPlayerByUsername(username);
    if (!socketId || !player) return;

    this.io.to(socketId).emit("playerUpdate", player.toDTO());
  }

  private sendAllPlayers() {
    const playerNames = Array.from(Memory.players.values()).map((player) =>
      player.getUsername()
    );

    this.io.emit("allPlayersUpdate", playerNames);
  }

  private emitPropertiesUpdate() {
    const propriedades = Memory.getAllPropertiesByArray();
    this.io.emit("propertiesUpdate", propriedades);
  }

  /**
   * Envia uma mensagem EXCLUSIVA para o histórico de UM jogador.
   * "Você fez tal coisa" - Ninguém mais vê.
   */
  private emitPersonalHistory(username: string, mensagem: string) {
    const socketId = Memory.getSocketIdByUsername(username);
    if (socketId) {
      this.io.to(socketId).emit("historyIncrement", mensagem);
    }
  }

  // ============================
  // 🔌 SOCKET EVENTS
  // ============================

  private registerEvents() {
    let dadoAtual = 0;
    let playersRegistred = 0;
    let playersRegistredReady = 0;

    // --- CONTROLE DE ESTADO DO TURNO ---
    let currentTurnHasRolled = false;
    let currentTurnUser: string;

    this.io.on("connection", (socket: Socket) => {
      console.log(`Novo socket conectado: ${socket.id}`);

      // ============================
      // REGISTRO & RECONEXÃO
      // ============================

      socket.on("reconnectPlayer", (username: string) => {
        const player = Memory.getPlayerByUsername(username);

        if (player) {
          console.log(
            `♻️ Reconectando jogador: ${username} (Novo Socket: ${socket.id})`
          );

          Memory.updateSocketId(username, socket.id);

          // 1. Envia dados básicos
          socket.emit("reconnectSuccess", player.toDTO());
          socket.emit("registerSuccess");

          // 2. Sincroniza o mundo
          this.sendAllPlayers();
          this.emitPropertiesUpdate();

          // 3. (CORREÇÃO) Envia a Propriedade onde o jogador está parado
          const propAtual = Memory.getPropriedadeById(player.getPosicao());
          socket.emit("currentRoundData", { propriedade: propAtual });

          this.emitPersonalHistory(
            username,
            `♻️ Você foi reconectado ao jogo.`
          );

          // 4. Se for a vez dele, restaura o estado do dado
          if (currentTurnUser === username) {
            socket.emit("yourTurn", {
              hasRolled: currentTurnHasRolled,
              lastValue: dadoAtual,
            });
          }
        } else {
          socket.emit(
            "registerFail",
            "Sessão expirada. Registre-se novamente."
          );
        }
      });

      socket.on("registerPlayer", (username: string) => {
        const success = Memory.registerPlayer(socket.id, username);

        if (success) {
          playersRegistred++;
          socket.emit("registerSuccess");
          this.sendAllPlayers();
          this.emitPlayerUpdate(username);
          this.emitPropertiesUpdate();

          this.emitPersonalHistory(username, `👋 Bem-vindo(a) ao jogo!`);
        } else {
          socket.emit(
            "registerFail",
            `Falha ao registrar esse nome: ${username}`
          );
        }
      });

      // ============================
      // READY / START
      // ============================

      socket.on("readyForInit", () => {
        playersRegistredReady++;
        console.log(
          `Players Prontos ${playersRegistredReady} / ${playersRegistred}`
        );

        if (playersRegistredReady === playersRegistred) {
          const players = Array.from(Memory.players.values());
          if (players.length === 0) return;

          this.currentTurnIndex = 0;
          const firstPlayer = players[0];
          const socketId = Memory.getSocketIdByUsername(firstPlayer.username);
          if (!socketId) return;

          this.io.emit("gameStarted");

          currentTurnUser = firstPlayer.username;
          currentTurnHasRolled = false; // Reset

          this.io.to(socketId).emit("yourTurn", { hasRolled: false });
          dadoAtual = Banco.rolarDados(); // Apenas inicializa var
        }
      });

      socket.on("notReadyForInit", () => {
        playersRegistredReady--;
      });

      // ============================
      // TURNO
      // ============================

      socket.on("sync_game", () => {
        const username = Memory.getUsernameBySocketId(socket.id)?.username;

        // 1. Recupera o Player para saber onde ele está
        if (username) {
          const player = Memory.getPlayerByUsername(username);
          if (player) {
            // (CORREÇÃO) Envia a propriedade atual sempre que sincronizar
            const propAtual = Memory.getPropriedadeById(player.getPosicao());
            socket.emit("currentRoundData", { propriedade: propAtual });
          }
        }

        // 2. Lógica de Turno
        if (currentTurnUser) {
          if (currentTurnUser === username) {
            socket.emit("yourTurn", {
              hasRolled: currentTurnHasRolled,
              lastValue: dadoAtual,
            });
          }
          socket.emit("turn_update", {
            playerDaVez: currentTurnUser,
          });
        }

        const playerNames = Array.from(Memory.players.values()).map((p) =>
          p.getUsername()
        );
        socket.emit("allPlayersUpdate", playerNames);
      });

      socket.on("finishTurn", () => {
        const info = Memory.getUsernameBySocketId(socket.id);
        if (!info) return;

        const players = Array.from(Memory.players.values());
        if (players.length === 0) return;

        this.currentTurnIndex = (this.currentTurnIndex + 1) % players.length;

        const nextPlayer = players[this.currentTurnIndex];
        const nextSocketId = Memory.getSocketIdByUsername(nextPlayer.username);
        if (!nextSocketId) return;

        // Atualiza variáveis de controle
        currentTurnUser = nextPlayer.username;
        currentTurnHasRolled = false; // Reseta para o próximo

        // 1. Avisa ESPECIFICAMENTE o próximo jogador que é a vez dele (Habilita botões)
        this.io.to(nextSocketId).emit("yourTurn", { hasRolled: false });

        // 2. Avisa TODOS quem é o jogador da vez (Atualiza TopBar e bloqueia os outros)
        this.io.emit("turn_update", { playerDaVez: nextPlayer.username });

        // Histórico
        this.emitPersonalHistory(nextPlayer.username, `🔔 Sua vez de jogar.`);
      });

      // ============================
      // DADO / MOVIMENTO
      // ============================

      socket.on("testDice", () => {
        const username = Memory.getUsernameBySocketId(socket.id)!.getUsername();
        const player = Memory.getPlayerByUsername(username);
        dadoAtual = Banco.rolarDados();
        const posicaoAntiga = player!.getPosicao();

        Banco.moverJogador(player!.getUsername(), dadoAtual);
        socket.emit("diceRolled", dadoAtual);

        this.emitPersonalHistory(
          username!,
          `🎲 Você tirou ${dadoAtual} (Teste).`
        );

        if (posicaoAntiga > player!.getPosicao()) {
          const pontoPartidaRes = Banco.pontoPartida(player!.getUsername());
          socket.emit("begginingPoint", pontoPartidaRes);
          if (pontoPartidaRes.status) {
            this.emitPersonalHistory(
              username!,
              `🔄 Você completou uma volta! +R$ 2000.`
            );
          }
        }

        socket.emit("currentRoundData", {
          propriedade: Memory.getPropriedadeById(player!.getPosicao()),
        });
      });

      socket.on("moveByPlayer", (qtd: number) => {
        const info = Memory.getUsernameBySocketId(socket.id);
        if (!info) return;
        const posicaoAntiga = info.getPosicao();

        Banco.soltarJogadorForcado(info.getUsername());
        Banco.moverJogador(info.getUsername(), qtd);

        this.emitPersonalHistory(
          info.username,
          `🚶 Você andou ${qtd} casas (Manual).`
        );

        if (posicaoAntiga > info.getPosicao()) {
          const pontoPartidaRes = Banco.pontoPartida(info.getUsername());
          socket.emit("begginingPoint", pontoPartidaRes);
          if (pontoPartidaRes.status) {
            this.emitPersonalHistory(
              info.username,
              `🔄 Bônus de volta: +R$ 2000.`
            );
          }
        }

        socket.emit("currentRoundData", {
          propriedade: Memory.getPropriedadeById(info.getPosicao()),
        });
        this.emitPlayerUpdate(info.username);
        this.emitPropertiesUpdate();
        this.io.emit("notification", `${info.username} andou ${qtd} casas.`);
      });

      socket.on("getMoneyByPlayer", (qtd: number) => {
        const info = Memory.getUsernameBySocketId(socket.id);
        if (!info) return;

        info.aumentarSaldo(qtd);
        this.emitPlayerUpdate(info.username);
        this.emitPropertiesUpdate();

        this.emitPersonalHistory(
          info.username,
          `💵 Você adicionou R$ ${qtd} à conta.`
        );
        this.io.emit(
          "notification",
          `${info.username} adicionou R$ ${qtd} à sua conta.`
        );
      });

      // --- ROLAGEM PRINCIPAL DO JOGO ---
      socket.on("rollDice", () => {
        const info = Memory.getUsernameBySocketId(socket.id);
        if (!info) return;

        if (currentTurnHasRolled) return; // Impede rerolagem no backend

        const player = Memory.getPlayerByUsername(info.username);
        if (!player) return;

        if (Banco.tentarSoltarJogador(info.username).solto) {
          dadoAtual = Banco.rolarDados();
          currentTurnHasRolled = true;

          const posicaoAntiga = player.getPosicao();
          Banco.moverJogador(info.username, dadoAtual);

          this.emitPersonalHistory(
            info.username,
            `🎲 Você tirou ${dadoAtual} e avançou.`
          );

          if (posicaoAntiga > player.getPosicao()) {
            const pontoPartidaRes = Banco.pontoPartida(player.getUsername());
            socket.emit("begginingPoint", pontoPartidaRes);
            if (pontoPartidaRes.status) {
              this.emitPersonalHistory(
                info.username,
                `💰 Bônus de Início: +R$ 2000.`
              );
            }
          }

          this.emitPlayerUpdate(info.username);
          this.emitPropertiesUpdate();
          console.log(player.getPosicao());
          socket.emit("diceRolled", dadoAtual);

          // Envia a nova propriedade para o Frontend
          socket.emit("currentRoundData", {
            propriedade: Memory.getPropriedadeById(player.getPosicao()),
          });
        } else {
          socket.emit("Jailled");
          this.emitPersonalHistory(
            info.username,
            `👮 Você está preso e perdeu a vez.`
          );
        }
      });

      // ============================
      // PROPRIEDADES
      // ============================

      socket.on("buyProperty", (id: number) => {
        const info = Memory.getUsernameBySocketId(socket.id);
        if (!info) return;

        const result = Banco.comprarPropriedade(id, info.username);
        const propriedadesArray = Memory.getAllPropertiesByArray();
        this.io.emit("propertiesUpdate", propriedadesArray);
        socket.emit("buyPropertyResult", result);
        this.emitPlayerUpdate(info.username);
        this.emitPropertiesUpdate();

        if (result.status) {
          const propNome = Memory.getPropriedadeById(id)?.getName();
          const preco = Memory.getPropriedadeById(id)?.getPrice();
          this.emitPersonalHistory(
            info.username,
            `🏠 Você comprou ${propNome} por R$ ${preco}.`
          );
        } else {
          this.emitPersonalHistory(
            info.username,
            `❌ Falha na compra: ${result.mensagem}`
          );
        }
      });

      socket.on("propertyTransaction", (id: number) => {
        const info = Memory.getUsernameBySocketId(socket.id);
        if (!info) return;

        const propriedade = Memory.getPropriedadeById(id);
        if (!propriedade) return;

        const donoAnterior = propriedade.getOwner();
        const result = Banco.transferenciaPropriedade(
          id,
          info.username,
          donoAnterior ?? ""
        );

        socket.emit("propertyTransactionResult", result);

        this.emitPlayerUpdate(info.username);
        if (donoAnterior) this.emitPlayerUpdate(donoAnterior);
        this.emitPropertiesUpdate();

        if (result.status) {
          this.emitPersonalHistory(
            info.username,
            `📝 Você transferiu ${propriedade.getName()} para ${
              donoAnterior || "alguém"
            }.`
          );
          if (donoAnterior) {
            this.emitPersonalHistory(
              donoAnterior,
              `📝 Você recebeu ${propriedade.getName()} de ${info.username}.`
            );
          }
        }
      });

      // ============================
      // BANCO
      // ============================

      socket.on("bankPayment", (valor: number) => {
        const info = Memory.getUsernameBySocketId(socket.id);
        if (!info) return;

        const result = Banco.pagamentoAoBanco(valor, info.username);
        socket.emit("bankPaymentResult", result);

        this.emitPlayerUpdate(info.username);

        if (result.status) {
          this.emitPersonalHistory(
            info.username,
            `💸 Você pagou R$ ${valor} ao Banco.`
          );
        }
      });

      socket.on("begginingPoint", () => {
        const info = Memory.getUsernameBySocketId(socket.id);
        if (!info) return;

        const result = Banco.pontoPartida(info.username);
        socket.emit("begginingPointResult", result);

        this.emitPlayerUpdate(info.username);

        if (result.status) {
          this.emitPersonalHistory(
            info.username,
            `💰 Resgate de Início: +R$ 2000.`
          );
        }
      });

      // ============================
      // IA
      // ============================

      socket.on("getMessage", async () => {
        const info = Memory.getUsernameBySocketId(socket.id)?.getUsername();
        if (!info) return;
        const mensagem = Carta.getCardRandomly(info);

        socket.emit("aiMessage", mensagem.mensagemPrivada);
        socket.emit("publicAiMessage", mensagem.mensagemPublica);

        this.emitPersonalHistory(
          info,
          `🃏 Carta: "${mensagem.mensagemPublica}"`
        );
      });

      socket.on(
        "transferPropertyToPlayer",
        ({ propertyId, targetUsername }) => {
          const info = Memory.getUsernameBySocketId(socket.id);
          if (!info) return;

          const propriedade = Memory.getPropriedadeById(propertyId);
          if (!propriedade) return;

          // Verificação de segurança: Só o dono pode transferir
          if (propriedade.getOwner() !== info.username) {
            return;
          }

          // Realiza a transferência (Lógica interna do Banco/Propriedade)
          // Como o método setOwner geralmente é simples, podemos fazer direto ou via Banco
          propriedade.setOwner(targetUsername);

          // Se houver lógica de resetar nível ao trocar de dono, aplique aqui.
          // Ex: propriedade.setLevel(0);

          // Notificações
          this.emitPlayerUpdate(info.username);
          this.emitPlayerUpdate(targetUsername);
          this.emitPropertiesUpdate();

          socket.emit("notification", `Propriedade transferida com sucesso.`);

          // Histórico Quem Enviou
          this.emitPersonalHistory(
            info.username,
            `🤝 Você transferiu ${propriedade.getName()} para ${targetUsername}.`
          );

          // Histórico Quem Recebeu
          this.emitPersonalHistory(
            targetUsername,
            `🎁 Você recebeu a escritura de ${propriedade.getName()} de ${
              info.username
            }.`
          );
        }
      );

      socket.on(
        "playerTransaction",
        (destinyUsername: string, valor: number) => {
          const senderPlayer = Memory.getUsernameBySocketId(socket.id);
          if (!senderPlayer) return;

          const sendingUsername = senderPlayer.getUsername();
          if (destinyUsername === "Banco") {
            senderPlayer.deduzirSaldo(valor);
            socket.emit("playerTrasactionResult", true);
          }
          const destinySocket = Memory.getSocketIdByUsername(destinyUsername);

          const resultado = Banco.transacaoMonetaria(
            valor,
            sendingUsername,
            destinyUsername
          );

          socket.emit("notification", resultado.msgDe);
          if (destinySocket) {
            this.io.to(destinySocket).emit("notification", resultado.msgPara);
          }
          socket.emit("playerTrasactionResult", resultado);

          this.emitPlayerUpdate(sendingUsername);
          this.emitPlayerUpdate(destinyUsername);
          this.emitPropertiesUpdate();

          if (resultado.status) {
            this.emitPersonalHistory(
              sendingUsername,
              `📤 Você enviou R$ ${valor} para ${destinyUsername}.`
            );
            this.emitPersonalHistory(
              destinyUsername,
              `📥 Você recebeu R$ ${valor} de ${sendingUsername}.`
            );
          }
        }
      );

      socket.on("sellToBank", (id: number) => {
        const username = Memory.getUsernameBySocketId(socket.id)?.getUsername();
        if (!username) return;

        const result = Banco.venderParaBanco(id, username);

        if (result.status) {
          const prop = Memory.getPropriedadeById(id);
          const player = Memory.getPlayerByUsername(username);

          if (!prop || !player) return;

          const valorRecebido = (prop.getPrice() || 0) * 0.8;

          socket.emit("soldToBank", {
            propriedade: prop.getName(),
            valor: valorRecebido,
          });

          this.io.emit("propertiesUpdate", Memory.getAllPropertiesByArray());
          socket.emit("playerUpdate", player);

          this.emitPersonalHistory(
            username,
            `📉 Você vendeu ${prop.getName()} por R$ ${valorRecebido}.`
          );
        } else {
          socket.emit("error", result.mensagem || "Erro ao vender");
        }
      });

      socket.on("upgradeProperty", (data) => {
        const username = Memory.getUsernameBySocketId(socket.id)?.getUsername();
        if (!username) return;

        const tentativa = Banco.aumentarLevelPropriedade(data, username);

        socket.emit("notification", tentativa);
        this.io.emit("propertiesUpdate", Memory.getAllPropertiesByArray());
        socket.emit("playerUpdate", Memory.getUsernameBySocketId(socket.id));

        this.emitPersonalHistory(username, `🏗️ ${tentativa}`);
      });

      socket.on("downgradeProperty", (data) => {
        const username = Memory.getUsernameBySocketId(socket.id)?.getUsername();
        if (!username) return;

        const tentativa = Banco.diminuirLevelPropriedade(data, username);

        socket.emit("notification", tentativa);
        this.io.emit("propertiesUpdate", Memory.getAllPropertiesByArray());
        socket.emit("playerUpdate", Memory.getUsernameBySocketId(socket.id));

        this.emitPersonalHistory(username, `🏚️ ${tentativa}`);
      });

      // ============================
      // DISCONNECT
      // ============================

      socket.on("disconnect", () => {
        console.log(`Socket desconectado: ${socket.id}`);
      });
    });
  }
}
