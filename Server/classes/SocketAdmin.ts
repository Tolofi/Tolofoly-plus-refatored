import { Memory } from "./Memory";
import { Banco } from "./Banco";
import { Server, Socket } from "socket.io";
import { stringify } from "node:querystring";
import { Carta } from "./CartaSorte";

export class SocketAdmin {
  private io: Server;
  private currentTurnIndex: number = 0;

  // --- NOVA PROPRIEDADE: Rastreia QUEM está pronto, não apenas QUANTOS ---
  private readyPlayers: Set<string> = new Set();

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
      player.getUsername(),
    );

    const playersObject = Array.from(Memory.players.values()).map((player) =>
      player.toDTO(),
    );

    this.io.emit("allPLayerObject", playersObject);
    this.io.emit("allPlayersUpdate", playerNames);
  }

  private emitPropertiesUpdate() {
    const propriedades = Memory.getAllPropertiesByArray();
    this.io.emit("propertiesUpdate", propriedades);
  }

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

    // --- CONTROLE DE ESTADO DO TURNO ---
    let currentTurnHasRolled = false;
    let currentTurnUser: string;

    this.io.on("connection", (socket: Socket) => {
      console.log(`Novo socket conectado: ${socket.id}`);

      socket.on("requestBoardData", () => {
        const propsParaEnviar = Object.fromEntries(Memory.propriedades);
        socket.emit("initProperties", propsParaEnviar);

        const listaJogadores = Array.from(Memory.players.values()).map((p) =>
          p.toDTO(),
        );
        socket.emit("allPLayerObject", listaJogadores);
      });
      this.sendAllPlayers();
      this.emitPropertiesUpdate();

      // ============================
      // REGISTRO & RECONEXÃO
      // ============================

      socket.on("reconnectPlayer", (username: string) => {
        const player = Memory.getPlayerByUsername(username);

        if (player) {
          console.log(
            `♻️ Reconectando jogador: ${username} (Novo Socket: ${socket.id})`,
          );

          Memory.updateSocketId(username, socket.id);

          socket.emit("reconnectSuccess", player.toDTO());
          socket.emit("registerSuccess");

          this.sendAllPlayers();
          this.emitPropertiesUpdate();

          const propAtual = Memory.getPropriedadeById(player.getPosicao());
          socket.emit("currentRoundData", { propriedade: propAtual });

          this.emitPersonalHistory(
            username,
            `♻️ Você foi reconectado ao jogo.`,
          );

          if (currentTurnUser === username) {
            socket.emit("yourTurn", {
              hasRolled: currentTurnHasRolled,
              lastValue: dadoAtual,
            });
          }
        } else {
          socket.emit(
            "registerFail",
            "Sessão expirada. Registre-se novamente.",
          );
        }
      });

      // --- LÓGICA DE REGISTRO E SUBSTITUIÇÃO ---
      socket.on("registerPlayer", (username: string) => {
        // 1. LIMPEZA PREVENTIVA (A Solução Nuclear)
        // Procura qualquer jogador que JÁ tenha esse nome, não importa o socket
        const playersArray = Array.from(Memory.players.values());
        const ghostPlayer = playersArray.find((p) => p.username === username);

        if (ghostPlayer) {
          console.log(`👻 Fantasma encontrado para ${username}. Removendo...`);

          // Tenta pegar o socket antigo desse fantasma
          const oldSocketId = Memory.getSocketIdByUsername(username);
          if (oldSocketId) {
            const oldSocket = this.io.sockets.sockets.get(oldSocketId);
            if (oldSocket) {
              oldSocket.disconnect(true); // Derruba a conexão antiga
            }
            // Remove do mapa de Sockets
            Memory.playerBySocketId.delete(oldSocketId);
          }

          // Remove do mapa de Jogadores (GARANTE que não duplica)
          Memory.players.delete(username);
        }

        // 2. REGISTRO LIMPO
        // Agora que garantimos que não existe ninguém com esse nome, registramos do zero
        const success = Memory.registerPlayer(socket.id, username);

        if (success) {
          console.log(`✅ Jogador registrado: ${username}`);
          socket.emit("registerSuccess");

          // Recupera dados se houver persistência (ou cria novo)
          const player = Memory.getPlayerByUsername(username);
          if (player) {
            socket.emit("reconnectSuccess", player.toDTO());

            // Reset visual da prisão
            const propInicial = Memory.getPropriedadeById(0);
            socket.emit("currentRoundData", { propriedade: propInicial });
            player.setPreso(false);
          }

          // Atualiza todo mundo
          this.sendAllPlayers();
          this.emitPlayerUpdate(username);
          this.emitPropertiesUpdate();

          this.emitPersonalHistory(username, `👋 Entrou no jogo.`);
        } else {
          socket.emit("registerFail", "Erro ao registrar. Tente outro nome.");
        }
      });

      // ============================
      // READY / START (CORRIGIDO)
      // ============================

      socket.on("readyForInit", () => {
        // 1. Identifica quem enviou o "Pronto"
        const username = Memory.getUsernameBySocketId(socket.id)?.getUsername();
        if (!username) return;

        // 2. Adiciona ao Conjunto (Set não permite duplicatas!)
        this.readyPlayers.add(username);

        const totalJogadores = Memory.players.size;
        const totalProntos = this.readyPlayers.size;

        console.log(`Players Prontos ${totalProntos} / ${totalJogadores}`);

        // 3. Verifica se todos estão prontos
        if (totalProntos === totalJogadores && totalJogadores > 0) {
          const players = Array.from(Memory.players.values());

          this.currentTurnIndex = 0;
          const firstPlayer = players[0];
          const socketId = Memory.getSocketIdByUsername(firstPlayer.username);

          // Limpa o set para o futuro (opcional, mas boa prática)
          // this.readyPlayers.clear();

          if (!socketId) return;

          this.io.emit("gameStarted");

          currentTurnUser = firstPlayer.username;
          currentTurnHasRolled = false;

          this.io.to(socketId).emit("yourTurn", { hasRolled: false });
          dadoAtual = Banco.rolarDados();
        }
      });

      socket.on("notReadyForInit", () => {
        const username = Memory.getUsernameBySocketId(socket.id)?.getUsername();
        if (username) {
          this.readyPlayers.delete(username); // Remove do Set
        }
      });

      // ============================
      // TURNO
      // ============================

      socket.on("sync_game", () => {
        const username = Memory.getUsernameBySocketId(socket.id)?.username;

        if (username) {
          const player = Memory.getPlayerByUsername(username);
          if (player) {
            const propAtual = Memory.getPropriedadeById(player.getPosicao());
            socket.emit("currentRoundData", { propriedade: propAtual });
          }
        }

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
          p.getUsername(),
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

        currentTurnUser = nextPlayer.username;
        currentTurnHasRolled = false;

        this.io.to(nextSocketId).emit("yourTurn", { hasRolled: false });
        this.io.emit("turn_update", { playerDaVez: nextPlayer.username });
      });

      // ============================
      // DADO / MOVIMENTO / PRISÃO
      // ============================

      socket.on("tentativaPrisao", ({ d1, d2 }) => {
        const info = Memory.getUsernameBySocketId(socket.id);
        if (!info) return;

        const player = Memory.getPlayerByUsername(info.username);
        if (!player) return;

        console.log(
          `Tentativa Prisão ${info.username}: ${d1} e ${d2}. Tentativa Atual: ${player.turnosPrisao}`,
        );

        const dadosIguais = d1 === d2;

        if (!dadosIguais) {
          player.turnosPrisao = (player.turnosPrisao || 0) + 1;
        }

        if (dadosIguais || player.turnosPrisao >= 3) {
          let mensagem = "";

          if (dadosIguais) {
            mensagem = "🎉 Você tirou dados iguais e está livre!";
            player.turnosPrisao = 0;
          } else {
            mensagem =
              "⚠️ 3ª tentativa falha. Multa de R$ 250 aplicada e você foi solto.";
            player.deduzirSaldo(250);
            player.turnosPrisao = 0;

            this.emitPersonalHistory(
              info.username,
              `💸 Pagou R$ 250 de fiança forçada.`,
            );
            socket.emit("bankPaymentResult", { status: true, valor: 250 });
          }

          player.setPreso(false);

          const soma = d1 + d2;
          const posicaoAntiga = player.getPosicao();
          Banco.moverJogador(info.username, soma);

          currentTurnHasRolled = true;
          dadoAtual = soma;

          socket.emit("notification", mensagem);
          this.emitPersonalHistory(
            info.username,
            `🎲 Tirou ${d1} e ${d2}. Saiu da prisão.`,
          );
          this.emitPersonalHistory(
            info.username,
            `🚶 ${Memory.getPropriedadeById(posicaoAntiga).getName()} -> ${Memory.getPropriedadeById(player.getPosicao()).getName()}`,
          );

          this.emitPlayerUpdate(info.username);
          this.sendAllPlayers();

          socket.emit("yourTurn", {
            hasRolled: true,
            lastValue: soma,
          });

          socket.emit("currentRoundData", {
            propriedade: Memory.getPropriedadeById(player.getPosicao()),
          });

          socket.emit("diceRolled", soma);
        } else {
          socket.emit(
            "notification",
            `❌ Falhou! (${d1} e ${d2}). Tentativa ${player.turnosPrisao}/3`,
          );
          this.emitPersonalHistory(
            info.username,
            `🎲 Tirou ${d1} e ${d2} e continua preso.`,
          );

          this.emitPlayerUpdate(info.username);
          this.sendAllPlayers();

          socket.emit("Jailled", {
            message: "Você continua preso.",
            autoFinish: true,
          });
        }
      });

      socket.on("testDice", () => {
        const username = Memory.getUsernameBySocketId(socket.id)!.getUsername();
        const player = Memory.getPlayerByUsername(username);
        dadoAtual = Banco.rolarDados();
        const posicaoAntiga = player!.getPosicao();

        Banco.moverJogador(player!.getUsername(), dadoAtual);
        this.sendAllPlayers();
        socket.emit("diceRolled", dadoAtual);

        this.emitPersonalHistory(
          username!,
          `🎲 Você tirou ${dadoAtual} (Teste).`,
        );

        if (posicaoAntiga > player!.getPosicao()) {
          const pontoPartidaRes = Banco.pontoPartida(player!.getUsername());
          socket.emit("begginingPoint", pontoPartidaRes);
          if (pontoPartidaRes.status) {
            this.emitPersonalHistory(
              username!,
              `🔄 Você completou uma volta! +R$ 2000.`,
            );
            this.sendAllPlayers();
          }
        }

        socket.emit("currentRoundData", {
          propriedade: Memory.getPropriedadeById(player!.getPosicao()),
        });
      });

      socket.on("soltarJogador", () => {
        const info = Memory.getUsernameBySocketId(socket.id);
        if (!info) return;

        Banco.soltarJogadorForcado(info.getUsername());
      });

      // ============================
      // SAIR DO JOGO (Resetar Player)
      // ============================

      socket.on("leaveGame", () => {
        // 1. Identifica quem está saindo
        const player = Memory.getUsernameBySocketId(socket.id);

        if (!player) return; // Se não achar, não faz nada

        const username = player.getUsername();
        console.log(`❌ Jogador saindo: ${username}`);

        // 2. Libera as propriedades e reseta o nível
        // Usamos o método da classe Player para saber quais IDs ele tem
        const propriedadesDoPlayer = player.getPropriedadesId();

        propriedadesDoPlayer.forEach((propId) => {
          const prop = Memory.getPropriedadeById(propId);
          if (prop) {
            prop.setOwner(null); // Remove o dono (fica sem dono)
            prop.level = 0; // Reseta casas/hotel para zero
          }
        });

        // 3. Remove o jogador da Memória
        Memory.players.delete(username);
        Memory.playerBySocketId.delete(socket.id);

        // Remove da lista de 'Prontos' se estiver lá
        if (this.readyPlayers.has(username)) {
          this.readyPlayers.delete(username);
        }

        // 4. Lógica de Turno (Se era a vez dele, passa para o próximo)
        if (currentTurnUser === username) {
          const remainingPlayers = Array.from(Memory.players.values());

          if (remainingPlayers.length > 0) {
            // Ajusta o índice para não estourar o array
            this.currentTurnIndex =
              this.currentTurnIndex % remainingPlayers.length;

            const nextPlayer = remainingPlayers[this.currentTurnIndex];
            currentTurnUser = nextPlayer.username;
            currentTurnHasRolled = false; // Reseta o estado do dado

            // Avisa o próximo jogador
            const nextSocketId = Memory.getSocketIdByUsername(
              nextPlayer.username,
            );
            if (nextSocketId) {
              this.io.to(nextSocketId).emit("yourTurn", { hasRolled: false });
            }

            this.io.emit("turn_update", { playerDaVez: nextPlayer.username });
            socket.broadcast.emit(
              "notification",
              `A vez passou para ${nextPlayer.username}.`,
            );
          } else {
            // Se não sobrou ninguém, reseta o turno
            currentTurnUser = "";
          }
        }

        // 5. Atualiza todos os clientes
        this.sendAllPlayers(); // Remove o boneco da tela
        this.emitPropertiesUpdate(); // Atualiza as cores do tabuleiro (volta ao original)

        // Notificação global (usando broadcast para não tentar mandar pro socket que saiu)
        socket.broadcast.emit(
          "notification",
          `${username} saiu do jogo. Propriedades liberadas!`,
        );
      });

      socket.on("rollDiceByPlayer", () => {
        const info = Memory.getUsernameBySocketId(socket.id);
        const qtd = Banco.rolarDados();
        if (!info) return;
        console.log("foi chamado");
        const player = info;
        const posicaoAntiga = player.getPosicao();

        Banco.soltarJogadorForcado(player.getUsername());
        Banco.moverJogador(player.getUsername(), qtd);

        const idAtual = Memory.getPropriedadeById(player.getPosicao())?.getId();

        if (idAtual === 30) {
          player.setPreso(true);
          player.posicao = 10;
          socket.emit("notification", "🚨 VOCÊ FOI PRESO! 🚨");
          socket.emit("Jailled");
        }

        this.sendAllPlayers();

        this.emitPersonalHistory(
          player.username,
          `🚶 Você girou o dado de novo e andou ${qtd} casas.`,
        );
        this.emitPersonalHistory(
          player.username,
          `🚶 ${Memory.getPropriedadeById(
            posicaoAntiga,
          ).getName()} -> ${Memory.getPropriedadeById(
            player.getPosicao(),
          ).getName()}`,
        );

        if (posicaoAntiga > player.getPosicao() && qtd >= 0) {
          const pontoPartidaRes = Banco.pontoPartida(player.getUsername());
          socket.emit("begginingPoint", pontoPartidaRes);
          if (pontoPartidaRes.status) {
            this.emitPersonalHistory(
              player.username,
              `🔄 Bônus de volta: +R$ 2000.`,
            );
            this.sendAllPlayers();
          }
        }

        if (posicaoAntiga < player.getPosicao() && qtd < 0) {
          const pontoPartidaRes = Banco.pontoPartida(player.getUsername());
          socket.emit("begginingPoint", pontoPartidaRes);
          if (pontoPartidaRes.status) {
            this.emitPersonalHistory(
              player.username,
              `🔄 Bônus de volta: +R$ 2000.`,
            );
            this.sendAllPlayers();
          }
        }

        socket.emit("currentRoundData", {
          propriedade: Memory.getPropriedadeById(player.getPosicao()),
        });
        this.emitPlayerUpdate(player.username);
        this.emitPropertiesUpdate();
        this.io.emit(
          "notification",
          `${player.username} girou o dado de novo e andou ${qtd} casas.`,
        );
      });

      socket.on("moveByPlayer", (qtd: number) => {
        const info = Memory.getUsernameBySocketId(socket.id);
        if (!info) return;

        const player = info;
        const posicaoAntiga = player.getPosicao();

        Banco.soltarJogadorForcado(player.getUsername());
        Banco.moverJogador(player.getUsername(), qtd);

        const idAtual = Memory.getPropriedadeById(player.getPosicao())?.getId();

        if (idAtual === 30) {
          player.setPreso(true);
          player.posicao = 10;
          socket.emit("notification", "🚨 VOCÊ FOI PRESO! 🚨");
          socket.emit("Jailled");
        }

        this.sendAllPlayers();

        this.emitPersonalHistory(
          player.username,
          `🚶 Você andou ${qtd} casas (Manual).`,
        );
        this.emitPersonalHistory(
          player.username,
          `🚶 ${Memory.getPropriedadeById(
            posicaoAntiga,
          ).getName()} -> ${Memory.getPropriedadeById(
            player.getPosicao(),
          ).getName()}`,
        );

        if (posicaoAntiga > player.getPosicao() && qtd >= 0) {
          const pontoPartidaRes = Banco.pontoPartida(player.getUsername());
          socket.emit("begginingPoint", pontoPartidaRes);
          if (pontoPartidaRes.status) {
            this.emitPersonalHistory(
              player.username,
              `🔄 Bônus de volta: +R$ 2000.`,
            );
            this.sendAllPlayers();
          }
        }

        if (posicaoAntiga < player.getPosicao() && qtd < 0) {
          const pontoPartidaRes = Banco.pontoPartida(player.getUsername());
          socket.emit("begginingPoint", pontoPartidaRes);
          if (pontoPartidaRes.status) {
            this.emitPersonalHistory(
              player.username,
              `🔄 Bônus de volta: +R$ 2000.`,
            );
            this.sendAllPlayers();
          }
        }

        socket.emit("currentRoundData", {
          propriedade: Memory.getPropriedadeById(player.getPosicao()),
        });
        this.emitPlayerUpdate(player.username);
        this.emitPropertiesUpdate();
        this.io.emit("notification", `${player.username} andou ${qtd} casas.`);
      });

      socket.on("getMoneyByPlayer", (qtd: number) => {
        const info = Memory.getUsernameBySocketId(socket.id);
        if (!info) return;

        info.aumentarSaldo(qtd);
        this.emitPlayerUpdate(info.username);
        this.sendAllPlayers();
        this.emitPropertiesUpdate();

        this.emitPersonalHistory(
          info.username,
          `💵 Você adicionou R$ ${qtd} à conta.`,
        );
        this.io.emit(
          "notification",
          `${info.username} adicionou R$ ${qtd} à sua conta.`,
        );
      });

      socket.on("rollDice", () => {
        const info = Memory.getUsernameBySocketId(socket.id);
        if (!info) return;

        if (currentTurnHasRolled) return;

        const player = Memory.getPlayerByUsername(info.username);
        if (!player) return;

        if (player.getPreso()) {
          socket.emit("Jailled");
          return;
        }

        dadoAtual = Banco.rolarDados();
        currentTurnHasRolled = true;

        const posicaoAntiga = player.getPosicao();

        Banco.moverJogador(info.username, dadoAtual);

        if (Memory.getPropriedadeById(player.getPosicao())?.getId() === 30) {
          player.setPreso(true);
          player.posicao = 10;
          socket.emit("notification", "🚨 VOCÊ FOI PRESO! 🚨");
        }

        this.emitPersonalHistory(
          info.username,
          `🎲 Você tirou ${dadoAtual} e avançou.`,
        );
        this.emitPersonalHistory(
          info.username,
          `🚶 ${Memory.getPropriedadeById(posicaoAntiga).getName()} -> ${Memory.getPropriedadeById(player.getPosicao()).getName()}`,
        );

        if (posicaoAntiga > player.getPosicao() && !player.getPreso()) {
          const pontoPartidaRes = Banco.pontoPartida(player.getUsername());
          socket.emit("begginingPoint", pontoPartidaRes);
          if (pontoPartidaRes.status) {
            this.emitPersonalHistory(
              info.username,
              `💰 Bônus de Início: +R$ 2000.`,
            );
          }
        }

        this.emitPlayerUpdate(info.username);
        this.emitPropertiesUpdate();
        this.sendAllPlayers();

        socket.emit("diceRolled", dadoAtual);

        socket.emit("currentRoundData", {
          propriedade: Memory.getPropriedadeById(player.getPosicao()),
        });
      });

      socket.on("buyProperty", (id: number) => {
        const info = Memory.getUsernameBySocketId(socket.id);
        if (!info) return;

        const result = Banco.comprarPropriedade(id, info.username);
        const propriedadesArray = Memory.getAllPropertiesByArray();
        this.io.emit("propertiesUpdate", propriedadesArray);
        socket.emit("buyPropertyResult", result);

        this.emitPlayerUpdate(info.username);
        this.sendAllPlayers();
        this.emitPropertiesUpdate();

        if (result.status) {
          const propNome = Memory.getPropriedadeById(id)?.getName();
          const preco = Memory.getPropriedadeById(id)?.getPrice();
          this.emitPersonalHistory(
            info.username,
            `🏠 Você comprou ${propNome} por R$ ${preco}.`,
          );
        } else {
          this.emitPersonalHistory(
            info.username,
            `❌ Falha na compra: ${result.mensagem}`,
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
          donoAnterior ?? "",
        );

        socket.emit("propertyTransactionResult", result);

        this.emitPlayerUpdate(info.username);
        if (donoAnterior) this.emitPlayerUpdate(donoAnterior);

        this.sendAllPlayers();
        this.emitPropertiesUpdate();

        if (result.status) {
          this.emitPersonalHistory(
            info.username,
            `📝 Você transferiu ${propriedade.getName()} para ${
              donoAnterior || "alguém"
            }.`,
          );
          if (donoAnterior) {
            this.emitPersonalHistory(
              donoAnterior,
              `📝 Você recebeu ${propriedade.getName()} de ${info.username}.`,
            );
          }
        }
      });

      socket.on("bankPayment", (valor: number) => {
        const info = Memory.getUsernameBySocketId(socket.id);
        if (!info) return;

        const result = Banco.pagamentoAoBanco(valor, info.username);
        socket.emit("bankPaymentResult", result);

        this.emitPlayerUpdate(info.username);
        this.sendAllPlayers();

        if (result.status) {
          this.emitPersonalHistory(
            info.username,
            `💸 Você pagou R$ ${valor} ao Banco.`,
          );
        }
      });

      socket.on("begginingPoint", () => {
        const info = Memory.getUsernameBySocketId(socket.id);
        if (!info) return;

        const result = Banco.pontoPartida(info.username);
        socket.emit("begginingPointResult", result);

        this.emitPlayerUpdate(info.username);
        this.sendAllPlayers();

        if (result.status) {
          this.emitPersonalHistory(
            info.username,
            `💰 Resgate de Início: +R$ 2000.`,
          );
        }
      });

      socket.on("getMessage", async () => {
        const info = Memory.getUsernameBySocketId(socket.id)?.getUsername();
        if (!info) return;
        const mensagem = Carta.getCardRandomly(info);

        socket.emit("aiMessage", mensagem.mensagemPrivada);
        socket.emit("publicAiMessage", mensagem.mensagemPublica);

        this.sendAllPlayers();

        this.emitPersonalHistory(
          info,
          `🃏 Carta: "${mensagem.mensagemPublica}"`,
        );
      });

      socket.on(
        "transferPropertyToPlayer",
        ({ propertyId, targetUsername }) => {
          const info = Memory.getUsernameBySocketId(socket.id);
          if (!info) return;

          const propriedade = Memory.getPropriedadeById(propertyId);
          if (!propriedade) return;

          if (propriedade.getOwner() !== info.username) {
            return;
          }

          propriedade.setOwner(targetUsername);

          this.emitPlayerUpdate(info.username);
          this.emitPlayerUpdate(targetUsername);
          this.sendAllPlayers();
          this.emitPropertiesUpdate();

          socket.emit("notification", `Propriedade transferida com sucesso.`);

          this.emitPersonalHistory(
            info.username,
            `🤝 Você transferiu ${propriedade.getName()} para ${targetUsername}.`,
          );

          this.emitPersonalHistory(
            targetUsername,
            `🎁 Você recebeu a escritura de ${propriedade.getName()} de ${
              info.username
            }.`,
          );
        },
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
            destinyUsername,
          );

          socket.emit("notification", resultado.msgDe);
          if (destinySocket) {
            this.io.to(destinySocket).emit("notification", resultado.msgPara);
          }
          socket.emit("playerTrasactionResult", resultado);

          this.emitPlayerUpdate(sendingUsername);
          this.emitPlayerUpdate(destinyUsername);
          this.sendAllPlayers();
          this.emitPropertiesUpdate();

          if (resultado.status) {
            this.emitPersonalHistory(
              sendingUsername,
              `📤 Você enviou R$ ${valor} para ${destinyUsername}.`,
            );
            this.emitPersonalHistory(
              destinyUsername,
              `📥 Você recebeu R$ ${valor} de ${sendingUsername}.`,
            );
          }
        },
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
          this.sendAllPlayers();

          this.emitPersonalHistory(
            username,
            `📉 Você vendeu ${prop.getName()} por R$ ${valorRecebido}.`,
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
        this.sendAllPlayers();

        this.emitPersonalHistory(username, `🏗️ ${tentativa}`);
      });

      socket.on("downgradeProperty", (data) => {
        const username = Memory.getUsernameBySocketId(socket.id)?.getUsername();
        if (!username) return;

        const tentativa = Banco.diminuirLevelPropriedade(data, username);

        socket.emit("notification", tentativa);
        this.io.emit("propertiesUpdate", Memory.getAllPropertiesByArray());
        socket.emit("playerUpdate", Memory.getUsernameBySocketId(socket.id));
        this.sendAllPlayers();

        this.emitPersonalHistory(username, `🏚️ ${tentativa}`);
      });

      socket.on("disconnect", () => {
        console.log(`Socket desconectado: ${socket.id}`);
      });
    });
  }
}
