import { Memory } from "./Memory";
import { Banco } from "./Banco";
import { Server, Socket } from "socket.io";
import { Carta } from "./CartaSorte";
import { gameVersion } from "./Version";
import { Propriedade } from "./Propriedade";
import { JornalService } from "./JornalService";

// Interface para organizar o estado do leilão
interface AuctionState {
  active: boolean;
  endTime: number;
  timer: NodeJS.Timeout | null;
  propriedade: Propriedade | null;
  totalBids: number;
  bids: Map<number, string>; // ID do Lance -> Username
  bidPrice: number;
}

export class SocketAdmin {
  private io: Server;
  private currentTurnIndex: number = 0;
  private readyPlayers: Set<string> = new Set();

  // --- ESTADO GLOBAL DO JOGO ---
  private currentTurnHasRolled: boolean = false;
  private currentTurnUser: string = "";
  private currentRound: number = 1;
  private dadoAtual: number = 0;
  private leilaoAprovadoTurnos: number = 0;

  // Controle de Dia/Noite
  private dayTurns: number = 0;
  private isDay: boolean = true;
  // REMOVIDO: private maxDayTurns... (Causava o bug pois iniciava com 0)

  // Contador de rodadas para o Jornal
  private rodadasTotais: number = 0;

  private isGameRunning: boolean = false;
  private turnosSemLeilao: number = 0;

  // --- ESTADO GLOBAL DO LEILÃO ---
  private auctionState: AuctionState = {
    active: false,
    endTime: 0,
    timer: null,
    propriedade: null,
    totalBids: 0,
    bids: new Map(),
    bidPrice: 200,
  };

  constructor(io: Server) {
    this.io = io;
    this.registerEvents();
  }

  private construtorDeConsole(): string {
    const usernames = Memory.getAllPlayerUsernameByArray();
    const sockets = Array.from(Memory.playerBySocketId.keys());

    const listaFormatada = usernames.map((nome, index) => {
      return `${index + 1}) ${nome} -> Socket: ${sockets[index]} `;
    });

    return `-> Players Conectados <-\n \n${
      listaFormatada.length === 0
        ? "\nNada por aqui ainda...\n \n"
        : listaFormatada.join("\n")
    }\n \n--------------------------`;
  }

  // ============================
  // 🔥 MÉTODOS DE LEILÃO
  // ============================

  private iniciarLeilao() {
    const propriedadesSemDono = Memory.getAllPropertiesByArray().filter(
      (propriedade) =>
        propriedade.getOwner() === null &&
        propriedade.getPrice() != null &&
        propriedade.getPrice()! > 1,
    );

    if (propriedadesSemDono.length === 0) return;

    const indiceAleatorio = Math.floor(
      Math.random() * propriedadesSemDono.length,
    );
    const propriedadeSorteada = propriedadesSemDono[indiceAleatorio];

    this.auctionState.active = true;
    this.auctionState.propriedade = propriedadeSorteada;
    this.auctionState.totalBids = 0;
    this.auctionState.bids.clear();

    this.io.emit("leilaoAnuncio", {
      propriedade: propriedadeSorteada,
      mensagem: "O leilão começará em 5 segundos...",
    });

    console.log("Iniciando leilão para: " + propriedadeSorteada.getName());

    setTimeout(() => {
      this.comecarLeilaoValendo(propriedadeSorteada);
    }, 5000);
  }

  private comecarLeilaoValendo(propriedade: Propriedade) {
    const DURACAO_INICIAL = 10000;
    this.auctionState.endTime = Date.now() + DURACAO_INICIAL;

    this.io.emit("leilaoIniciado", {
      propriedade: propriedade,
      endTime: this.auctionState.endTime,
      precoInicial: propriedade.getPrice(),
      valorLance: this.auctionState.bidPrice,
    });

    this.agendarFimDoLeilao(DURACAO_INICIAL);
  }

  private processarLance(socket: Socket) {
    if (!this.auctionState.active || !this.auctionState.propriedade) return;

    const jogador = Memory.getUsernameBySocketId(socket.id);
    if (!jogador) return;

    const precoPropriedade = this.auctionState.propriedade.getPrice() || 0;
    const custoAtual =
      precoPropriedade +
      this.auctionState.totalBids * this.auctionState.bidPrice +
      this.auctionState.bidPrice;

    if (jogador.getSaldo() < custoAtual) {
      socket.emit("erro", "Saldo insuficiente.");
      return;
    }

    this.auctionState.totalBids++;
    this.auctionState.bids.set(
      this.auctionState.totalBids,
      jogador.getUsername(),
    );

    const agora = Date.now();
    const tempoRestanteReal = this.auctionState.endTime - agora;

    if (tempoRestanteReal < 2000) {
      const TEMPO_EXTRA = 2000;
      this.auctionState.endTime += TEMPO_EXTRA;

      if (this.auctionState.timer) clearTimeout(this.auctionState.timer);

      const novoTempoRestante = this.auctionState.endTime - Date.now();
      this.agendarFimDoLeilao(novoTempoRestante);

      this.io.emit("leilaoTempoEstendido", {
        novoTempoRestante: novoTempoRestante,
      });
    }

    this.io.emit("leilaoNovoLance", {
      username: jogador.getUsername(),
      totalBids: this.auctionState.totalBids,
      valorAtual: custoAtual,
    });
  }

  private agendarFimDoLeilao(duracaoMs: number) {
    this.auctionState.timer = setTimeout(() => {
      this.finalizarLeilao();
    }, duracaoMs);
  }

  private finalizarLeilao() {
    this.auctionState.active = false;
    if (this.auctionState.timer) clearTimeout(this.auctionState.timer);

    const prop = this.auctionState.propriedade!;

    if (this.auctionState.totalBids === 0) {
      this.io.emit("boardVencedor", {
        title: "Leilão Encerrado",
        content: `Ninguém arrematou ${prop.getName()}. Continua sem dono.`,
      });

      this.io.emit("leilaoFim", {
        mensagem: "Sem lances.",
      });
      return;
    }

    const vencedorUsername = this.auctionState.bids.get(
      this.auctionState.totalBids,
    );

    if (vencedorUsername) {
      const custoLances =
        this.auctionState.totalBids * this.auctionState.bidPrice;

      Banco.comprarPropriedade(prop.getId(), vencedorUsername);

      const vencedor = Memory.getPlayerByUsername(vencedorUsername);

      if (vencedor) {
        vencedor.deduzirSaldo(custoLances);
      }

      const valorTotalPago = (prop.getPrice() || 0) + custoLances;

      this.io.emit("boardVencedor", {
        title: "Temos um Vencedor!",
        content: `${vencedorUsername} arrematou ${prop.getName()} por R$ ${valorTotalPago}!`,
      });

      setTimeout(() => {
        if (vencedor) {
          this.io.to(vencedor.socketId).emit("leilaoGanho", valorTotalPago);
          this.emitPlayerUpdate(vencedorUsername);
        }
        this.emitPropertiesUpdate();
        this.sendAllPlayers();
        this.io.emit("leilaoFim");
      }, 2000);
    }
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

  private atualizarTerminal() {
    console.clear();
    console.log(this.construtorDeConsole());
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
    this.io.on("connection", (socket: Socket) => {
      socket.on("auctionDoBid", () => {
        this.processarLance(socket);
      });

      this.atualizarTerminal();

      socket.emit("checkVersion", gameVersion);

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

      socket.on("reconnectPlayer", (username: string) => {
        const player = Memory.getPlayerByUsername(username);

        if (player) {
          Memory.updateSocketId(username, socket.id);

          socket.emit("reconnectSuccess", player.toDTO());
          socket.emit("registerSuccess");
          this.atualizarTerminal();
          this.sendAllPlayers();
          this.emitPropertiesUpdate();

          const propAtual = Memory.getPropriedadeById(player.getPosicao());
          socket.emit("currentRoundData", { propriedade: propAtual });

          this.emitPersonalHistory(
            username,
            `♻️ Você foi reconectado ao jogo.`,
          );

          if (this.currentTurnUser === username) {
            socket.emit("yourTurn", {
              hasRolled: this.currentTurnHasRolled,
              lastValue: this.dadoAtual,
            });
          }
        } else {
          socket.emit(
            "registerFail",
            "Sessão expirada. Registre-se novamente.",
          );
        }
      });

      socket.on("registerPlayer", (rawUsername: string) => {
        const username = rawUsername.trim();
        const playersArray = Array.from(Memory.players.values());
        const ghostPlayer = playersArray.find((p) => p.username === username);

        if (ghostPlayer) {
          console.log(`♻️ Recuperando sessão para: ${username}`);

          const oldSocketId = Memory.getSocketIdByUsername(username);
          if (oldSocketId) {
            const oldSocket = this.io.sockets.sockets.get(oldSocketId);
            if (oldSocket) oldSocket.disconnect(true);
            Memory.playerBySocketId.delete(oldSocketId);
          }

          ghostPlayer.socketId = socket.id;
          Memory.playerBySocketId.set(socket.id, ghostPlayer);

          this.atualizarTerminal();
          socket.emit("registerSuccess");
          socket.emit("reconnectSuccess", ghostPlayer.toDTO());

          const propAtual = Memory.getPropriedadeById(ghostPlayer.getPosicao());
          socket.emit("currentRoundData", { propriedade: propAtual });

          this.sendAllPlayers();
          this.emitPlayerUpdate(username);
          this.emitPropertiesUpdate();

          this.emitPersonalHistory(username, `👋 Você retornou ao jogo.`);

          if (this.currentTurnUser === username) {
            socket.emit("yourTurn", {
              hasRolled: this.currentTurnHasRolled,
              lastValue: this.dadoAtual,
            });
          }

          if (this.currentTurnUser) {
            socket.emit("turn_update", {
              playerDaVez: this.currentTurnUser,
            });
          }
        } else {
          const success = Memory.registerPlayer(socket.id, username);

          if (success) {
            this.atualizarTerminal();
            socket.emit("registerSuccess");

            const player = Memory.getPlayerByUsername(username);
            if (player) {
              socket.emit("reconnectSuccess", player.toDTO());
              const propInicial = Memory.getPropriedadeById(0);
              socket.emit("currentRoundData", { propriedade: propInicial });
              player.setPreso(false);
            }

            this.sendAllPlayers();
            this.emitPlayerUpdate(username);
            this.emitPropertiesUpdate();

            this.emitPersonalHistory(username, `👋 Entrou no jogo.`);
          } else {
            socket.emit("registerFail", "Erro ao registrar. Tente outro nome.");
          }
        }
      });

      socket.on("readyForInit", () => {
        if (this.isGameRunning) {
          const username = Memory.getUsernameBySocketId(socket.id)?.username;

          if (username) {
            const player = Memory.getPlayerByUsername(username);
            if (player) {
              const propAtual = Memory.getPropriedadeById(player.getPosicao());
              // socket.emit("playerUpdate", player.toDTO());
              socket.emit("currentRoundData", { propriedade: propAtual });
              this.sendAllPlayers();
              this.emitPlayerUpdate(username);
              this.emitPropertiesUpdate();
            }
          }

          if (this.currentTurnUser) {
            if (this.currentTurnUser === username) {
              socket.emit("yourTurn", {
                hasRolled: this.currentTurnHasRolled,
                lastValue: this.dadoAtual,
              });
            }
            socket.emit("turn_update", {
              playerDaVez: this.currentTurnUser,
            });
          }

          const playerNames = Array.from(Memory.players.values()).map((p) =>
            p.getUsername(),
          );
          socket.emit("allPlayersUpdate", playerNames);
          socket.emit("gameAlreadyRunning");
          this.io.emit("turn_update", {
            playerDaVez: this.currentTurnUser,
          });

          return;
        }

        const username = Memory.getUsernameBySocketId(socket.id)?.getUsername();
        if (!username) return;

        this.readyPlayers.add(username);

        const totalJogadores = Memory.players.size;
        const totalProntos = this.readyPlayers.size;

        if (totalProntos === totalJogadores && totalJogadores > 0) {
          this.isGameRunning = true;

          const players = Array.from(Memory.players.values());

          this.currentTurnIndex = 0;
          const firstPlayer = players[0];
          const socketId = Memory.getSocketIdByUsername(firstPlayer.username);

          if (!socketId) return;
          Memory.randomizeWeather();
          Memory.setGlobalHour("dia");
          this.dayTurns = 0; // Inicia zerado
          this.io.emit("gameStarted");

          this.currentTurnUser = firstPlayer.username;
          this.currentTurnHasRolled = false;

          setTimeout(() => {
            this.io.to(socketId).emit("yourTurn", { hasRolled: false });

            // Envia atualização de estado para garantir que ele tenha os dados
            this.io.to(socketId).emit("turn_update", {
              playerDaVez: this.currentTurnUser,
            });
          }, 1000);
          this.dadoAtual = Banco.rolarDados();
        }
      });

      socket.on("notReadyForInit", () => {
        const username = Memory.getUsernameBySocketId(socket.id)?.getUsername();
        if (username) {
          this.readyPlayers.delete(username);
        }
      });

      socket.on("sync_game", (data) => {
        const username = data;
        if (username) {
          const player = Memory.getPlayerByUsername(username);
          if (player) {
            socket.emit("playerUpdate", player.toDTO());
            const propAtual = Memory.getPropriedadeById(player.getPosicao());
            socket.emit("currentRoundData", { propriedade: propAtual });
          }
        }

        if (this.currentTurnUser) {
          if (this.currentTurnUser === username) {
            socket.emit("yourTurn", {
              hasRolled: this.currentTurnHasRolled,
              lastValue: this.dadoAtual,
            });
          }
          socket.emit("turn_update", {
            playerDaVez: this.currentTurnUser,
          });
        }

        const playerNames = Array.from(Memory.players.values()).map((p) =>
          p.getUsername(),
        );
        socket.emit("allPlayersUpdate", playerNames);
      });

      // --- [CORREÇÃO AQUI] Lógica de Finalizar Turno ---
      socket.on("finishTurn", () => {
        const info = Memory.getUsernameBySocketId(socket.id);
        if (!info) return;

        const players = Array.from(Memory.players.values());
        if (players.length === 0) return;

        this.currentTurnIndex = (this.currentTurnIndex + 1) % players.length;

        // 📰 SISTEMA DE JORNAL & RODADAS
        // Se voltou ao primeiro jogador (index 0), significa que UMA RODADA COMPLETA passou
        if (this.currentTurnIndex === 0) {
          this.rodadasTotais++;
          console.log(`🔄 Fim da Rodada ${this.rodadasTotais}`);

          // A cada 5 rodadas completas, gera uma edição
          if (this.rodadasTotais > 0 && this.rodadasTotais % 5 === 0) {
            console.log("📰 Gerando edição do jornal...");
            const noticia = JornalService.gerarEdicao();
            this.io.emit("showNewspaper", noticia);
          }
        }

        const nextPlayer = players[this.currentTurnIndex];
        const nextSocketId = Memory.getSocketIdByUsername(nextPlayer.username);
        if (!nextSocketId) return;

        this.currentTurnUser = nextPlayer.username;
        this.currentTurnHasRolled = false;

        // ☀️🌙 CORREÇÃO LÓGICA DIA/NOITE
        this.dayTurns++;

        // Verifica o tamanho real dos jogadores agora
        const totalJogadores = Memory.players.size;

        // Só troca o dia se TODOS jogaram (1 rodada completa)
        if (this.dayTurns >= totalJogadores) {
          this.dayTurns = 0;
          this.isDay = !this.isDay;
          const novoHorario = this.isDay ? "dia" : "noite";

          Memory.setGlobalHour(novoHorario);
          Memory.randomizeWeather();
          this.emitPropertiesUpdate();

          const icon = this.isDay ? "☀️" : "🌙";
          this.io.emit(
            "notification",
            `${icon} O horário mudou para: ${novoHorario.toUpperCase()}`,
          );
        }

        this.io.to(nextSocketId).emit("yourTurn", { hasRolled: false });
        this.io.emit("turn_update", { playerDaVez: nextPlayer.username });
        this.currentRound++;

        // LEILÃO (Mecânica de Piedade/Aleatória)
        this.turnosSemLeilao++;
        const sorte = Math.floor(Math.random() * 10) + 1 === 1;
        const garantia = this.turnosSemLeilao >= 10;

        if ((sorte || garantia) && this.leilaoAprovadoTurnos === 0) {
          this.leilaoAprovadoTurnos = 1;
          this.io.emit("leilaoAprovado", {
            title: "LEILÃO APROVADO!",
            content: "O governo aprovou o leilão de uma propriedade...",
          });
        } else if (
          this.leilaoAprovadoTurnos > 0 &&
          this.leilaoAprovadoTurnos < 3
        ) {
          this.leilaoAprovadoTurnos++;
        } else if (this.leilaoAprovadoTurnos === 3) {
          this.iniciarLeilao();
          this.turnosSemLeilao = 0;
          this.leilaoAprovadoTurnos = 0;
        }
      });

      // ============================
      // DADO / MOVIMENTO / PRISÃO / VENDAS / ETC (Mantidos iguais)
      // ============================

      socket.on("tentativaPrisao", ({ d1, d2 }) => {
        const info = Memory.getUsernameBySocketId(socket.id);
        if (!info) return;

        const player = Memory.getPlayerByUsername(info.username);
        if (!player) return;

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

          this.currentTurnHasRolled = true;
          this.dadoAtual = soma;

          socket.emit("notification", mensagem);
          this.emitPersonalHistory(
            info.username,
            `🎲 Tirou ${d1} e ${d2}. Saiu da prisão.`,
          );
          this.emitPersonalHistory(
            info.username,
            `🚶 ${Memory.getPropriedadeById(
              posicaoAntiga,
            )?.getName()} -> ${Memory.getPropriedadeById(
              player.getPosicao(),
            )?.getName()}`,
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
        this.dadoAtual = Banco.rolarDados();
        const posicaoAntiga = player!.getPosicao();

        Banco.moverJogador(player!.getUsername(), this.dadoAtual);
        this.sendAllPlayers();
        socket.emit("diceRolled", this.dadoAtual);

        this.emitPersonalHistory(
          username!,
          `🎲 Você tirou ${this.dadoAtual} (Teste).`,
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

      socket.on("leaveGame", () => {
        const player = Memory.getUsernameBySocketId(socket.id);

        if (!player) return;

        const username = player.getUsername();

        const propriedadesDoPlayer = player.getPropriedadesId();

        propriedadesDoPlayer.forEach((propId) => {
          const prop = Memory.getPropriedadeById(propId);
          if (prop) {
            prop.setOwner(null);
            prop.level = 0;
          }
        });

        Memory.players.delete(username);
        Memory.playerBySocketId.delete(socket.id);

        if (this.readyPlayers.has(username)) {
          this.readyPlayers.delete(username);
        }

        this.atualizarTerminal();

        if (this.currentTurnUser === username) {
          const remainingPlayers = Array.from(Memory.players.values());

          if (remainingPlayers.length > 0) {
            this.currentTurnIndex =
              this.currentTurnIndex % remainingPlayers.length;

            const nextPlayer = remainingPlayers[this.currentTurnIndex];
            this.currentTurnUser = nextPlayer.username;
            this.currentTurnHasRolled = false;

            const nextSocketId = Memory.getSocketIdByUsername(
              nextPlayer.username,
            );
            if (nextSocketId) {
              this.io.to(nextSocketId).emit("yourTurn", { hasRolled: false });
            }

            this.io.emit("turn_update", {
              playerDaVez: nextPlayer.username,
            });
            socket.broadcast.emit(
              "notification",
              `A vez passou para ${nextPlayer.username}.`,
            );
          } else {
            this.currentTurnUser = "";
          }
        }

        this.sendAllPlayers();
        this.emitPropertiesUpdate();

        socket.broadcast.emit(
          "notification",
          `${username} saiu do jogo. Propriedades liberadas!`,
        );

        if (Memory.players.size === 0) {
          this.isGameRunning = false;
          this.readyPlayers.clear();
          this.currentTurnHasRolled = false;
          this.turnosSemLeilao = 0;
          this.rodadasTotais = 0;
        }
      });

      socket.on("rollDiceByPlayer", () => {
        const info = Memory.getUsernameBySocketId(socket.id);
        const qtd = Banco.rolarDados();
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
          `🚶 Você girou o dado de novo e andou ${qtd} casas.`,
        );
        this.emitPersonalHistory(
          player.username,
          `🚶 ${Memory.getPropriedadeById(
            posicaoAntiga,
          )?.getName()} -> ${Memory.getPropriedadeById(
            player.getPosicao(),
          )?.getName()}`,
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
          )?.getName()} -> ${Memory.getPropriedadeById(
            player.getPosicao(),
          )?.getName()}`,
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

        if (this.currentTurnHasRolled) return;

        const player = Memory.getPlayerByUsername(info.username);
        if (!player) return;

        if (player.getPreso()) {
          socket.emit("Jailled");
          return;
        }

        this.dadoAtual = Banco.rolarDados();
        this.currentTurnHasRolled = true;

        const posicaoAntiga = player.getPosicao();

        Banco.moverJogador(info.username, this.dadoAtual);

        if (Memory.getPropriedadeById(player.getPosicao())?.getId() === 30) {
          player.setPreso(true);
          player.posicao = 10;
          socket.emit("notification", "🚨 VOCÊ FOI PRESO! 🚨");
        }

        this.emitPersonalHistory(
          info.username,
          `🎲 Você tirou ${this.dadoAtual} e avançou.`,
        );
        this.emitPersonalHistory(
          info.username,
          `🚶 ${Memory.getPropriedadeById(
            posicaoAntiga,
          )?.getName()} -> ${Memory.getPropriedadeById(
            player.getPosicao(),
          )?.getName()}`,
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

        socket.emit("diceRolled", this.dadoAtual);

        socket.emit("currentRoundData", {
          propriedade: Memory.getPropriedadeById(player.getPosicao()),
        });
      });

      socket.on(
        "receipt",
        (data: { remetente: string; valor: number; destinatario: string }) => {
          const currentSocket = Memory.getSocketIdByUsername(data.remetente);
          if (currentSocket) {
            this.io.to(currentSocket).emit("transactionReceipt", data);
          }
        },
      );

      socket.on(
        "cardThrowed",
        (data: { remetente: string; valor: number; destinatario: string }) => {
          this.io.emit("machineTransaction", data);
        },
      );

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
        const mensagem = await Carta.getCardRandomly(info);

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
          const targetObject = Memory.getPlayerByUsername(targetUsername);
          if (!info) return;

          const propriedade = Memory.getPropriedadeById(propertyId);
          if (!propriedade) return;

          if (propriedade.getOwner() !== info.username) {
            return;
          }

          propriedade.setOwner(targetUsername);
          targetObject?.adicionarPropriedade(propriedade.getId(), propriedade);
          info.removerPropriedade(propriedade.getId());

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

          if (destinySocket) {
            this.io.to(destinySocket).emit("notification", resultado.msgPara);
          }
          socket.emit("playerTransactionResult", resultado);

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
      socket.on(
        "playerRentPay",
        (destinyUsername: string, valor: number, propriedadeId: number) => {
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

          if (destinySocket) {
            this.io.to(destinySocket).emit("notification", resultado.msgPara);
          }
          socket.emit("playerTransactionResult", resultado);

          if (resultado.status) {
            this.emitPersonalHistory(
              sendingUsername,
              `📤 Você enviou R$ ${valor} para ${destinyUsername}.`,
            );
            this.emitPersonalHistory(
              destinyUsername,
              `📥 Você recebeu R$ ${valor} de ${sendingUsername}.`,
            );
            socket.emit("rentPaid");
            Memory.getPropriedadeById(propriedadeId)?.addCapital(valor);
          }
          this.emitPlayerUpdate(sendingUsername);
          this.emitPlayerUpdate(destinyUsername);
          this.sendAllPlayers();
          this.emitPropertiesUpdate();
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
          socket.emit("playerUpdate", player.toDTO());
          this.sendAllPlayers();

          this.emitPersonalHistory(
            username,
            `📉 Você vendeu ${prop.getName()} por R$ ${valorRecebido}.`,
          );
        } else {
          socket.emit("notification", result.mensagem || "Erro ao vender");
        }
      });

      socket.on("upgradeProperty", (data) => {
        const username = Memory.getUsernameBySocketId(socket.id)?.getUsername();
        if (!username) return;

        const tentativa = Banco.aumentarLevelPropriedade(data, username);

        socket.emit("notification", tentativa);
        this.io.emit("propertiesUpdate", Memory.getAllPropertiesByArray());
        socket.emit(
          "playerUpdate",
          Memory.getPlayerByUsername(username)?.toDTO(),
        );
        this.sendAllPlayers();

        this.emitPersonalHistory(username, `🏗️ ${tentativa}`);
      });

      socket.on("downgradeProperty", (data) => {
        const username = Memory.getUsernameBySocketId(socket.id)?.getUsername();
        if (!username) return;

        const tentativa = Banco.diminuirLevelPropriedade(data, username);

        socket.emit("notification", tentativa);
        this.io.emit("propertiesUpdate", Memory.getAllPropertiesByArray());
        socket.emit(
          "playerUpdate",
          Memory.getPlayerByUsername(username)?.toDTO(),
        );
        this.sendAllPlayers();

        this.emitPersonalHistory(username, `🏚️ ${tentativa}`);
      });

      socket.on("disconnect", () => {
        // console.log(`Socket desconectado: ${socket.id}`);
      });
    });
  }
}
