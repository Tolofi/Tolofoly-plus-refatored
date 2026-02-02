/**
 * SocketAdmin - Gerenciador central de todas as conexões e lógica do jogo
 * Coordena turnos, movimentações, transações, leilões e eventos globais
 * Responsável por sincronizar estado entre servidor e clientes via WebSocket
 * 
 * Estrutura:
 * - Gerenciamento de turnos e ordem de jogo
 * - Processamento de movimentações (dados, teleportes, propriedades)
 * - Sistema de leilões para propriedades
 * - Eventos climáticos e sistema de jornal
 * - Sistema de prisão e cartas de sorte/azar
 * - Sincronização de estado com clientes
 */

import { Memory } from "./Memory";
import { Banco } from "./Banco";
import { Server, Socket } from "socket.io";
import { Carta } from "./CartaSorte";
import { gameVersion } from "./Version";
import { Propriedade } from "./Propriedade";
import { JornalService } from "./JornalService";

/**
 * Interface AuctionState - Mantém o estado do leilão ativo
 * Armazena informações sobre propriedade sendo leiloada e lances recebidos
 */
interface AuctionState {
  active: boolean; // Se há um leilão em progresso
  endTime: number; // Timestamp de quando o leilão termina
  timer: NodeJS.Timeout | null; // Referência do timer do leilão
  propriedade: Propriedade | null; // Propriedade sendo leiloada
  totalBids: number; // Número total de lances recebidos
  bids: Map<number, string>; // Mapa de lances (preço -> jogador)
  bidPrice: number; // Maior lance atual
}

export class SocketAdmin {
  private io: Server;
  private currentTurnIndex: number = 0; // Índice do jogador atual
  private readyPlayers: Set<string> = new Set(); // Jogadores prontos para começar

  // ==================== ESTADO GLOBAL DO JOGO ====================
  private currentTurnHasRolled: boolean = false; // Se o jogador atual já rolou os dados
  private currentTurnUser: string = ""; // Username do jogador da vez
  private currentRound: number = 1; // Número da rodada atual
  private dadoAtual: number = 0; // Valor do último dado rolado
  private leilaoAprovadoTurnos: number = 0; // Turnos desde último leilão

  // Controle de Dia/Noite - Afeta o aluguel das propriedades
  private dayTurns: number = 0; // Turnos passados no dia/noite atual
  private isDay: boolean = true; // Se está no período do dia

  // Contador para gerar notícias do jornal
  private rodadasTotais: number = 0;

  private isGameRunning: boolean = false; // Se o jogo está em progresso
  private turnosSemLeilao: number = 0; // Contador para forçar leilão

  // ==================== ESTADO DO LEILÃO ====================
  private auctionState: AuctionState = {
    active: false,
    endTime: 0,
    timer: null,
    propriedade: null,
    totalBids: 0,
    bids: new Map(),
    bidPrice: 200,
  };

  /**
   * Construtor do SocketAdmin
   * @param io - Instância do servidor Socket.io
   */
  constructor(io: Server) {
    this.io = io;
    this.registerEvents();
  }

  /**
   * Formata lista de jogadores conectados para exibição no console
   * Mostra username e ID de socket de cada jogador
   * @returns String formatada com lista de jogadores
   */
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
  // SISTEMA DE LEILÃO
  // ============================
  // Gerencia leilões de propriedades não compradas
  // Um leilão é iniciado após certos turnos sem compra

  /**
   * Inicia um novo leilão sorteando uma propriedade sem dono
   * Emite notificação aos clientes com 5 segundos de espera
   */
  private iniciarLeilao() {
    // Filtra apenas propriedades que podem ser compradas e não têm dono
    const propriedadesSemDono = Memory.getAllPropertiesByArray().filter(
      (propriedade) =>
        propriedade.getOwner() === null &&
        propriedade.getPrice() != null &&
        propriedade.getPrice()! > 1,
    );

    if (propriedadesSemDono.length === 0) return;

    // Sorteia uma propriedade aleatória
    const indiceAleatorio = Math.floor(
      Math.random() * propriedadesSemDono.length,
    );
    const propriedadeSorteada = propriedadesSemDono[indiceAleatorio];

    // Inicializa estado do leilão
    this.auctionState.active = true;
    this.auctionState.propriedade = propriedadeSorteada;
    this.auctionState.totalBids = 0;
    this.auctionState.bids.clear();

    // Notifica todos os jogadores que um leilão vai começar
    this.io.emit("leilaoAnuncio", {
      propriedade: propriedadeSorteada,
      mensagem: "O leilão começará em 5 segundos...",
    });

    console.log("Iniciando leilão para: " + propriedadeSorteada.getName());

    // Aguarda 5 segundos e começa efetivamente
    setTimeout(() => {
      this.comecarLeilaoValendo(propriedadeSorteada);
    }, 5000);
  }

  /**
   * Inicia o leilão "de verdade" com timer de 10 segundos
   * Jogadores têm esse tempo para fazer lances
   * @param propriedade - Propriedade sendo leiloada
   */
  private comecarLeilaoValendo(propriedade: Propriedade) {
    const DURACAO_INICIAL = 10000; // 10 segundos
    this.auctionState.endTime = Date.now() + DURACAO_INICIAL;

    // Emite para todos os clientes os dados do leilão
    this.io.emit("leilaoIniciado", {
      propriedade: propriedade,
      endTime: this.auctionState.endTime,
      precoInicial: propriedade.getPrice(),
      valorLance: this.auctionState.bidPrice,
    });

    this.agendarFimDoLeilao(DURACAO_INICIAL);
  }

  /**
   * Processa um lance de um jogador durante o leilão
   * Valida saldo, estende tempo se necessário, e atualiza estado
   * @param socket - Socket do jogador que fez o lance
   */
  private processarLance(socket: Socket) {
    // Valida se há um leilão ativo
    if (!this.auctionState.active || !this.auctionState.propriedade) return;

    const jogador = Memory.getUsernameBySocketId(socket.id);
    if (!jogador) return;

    // Calcula o custo total do lance atual
    const precoPropriedade = this.auctionState.propriedade.getPrice() || 0;
    const custoAtual =
      precoPropriedade +
      this.auctionState.totalBids * this.auctionState.bidPrice +
      this.auctionState.bidPrice;

    // Valida se o jogador tem saldo suficiente
    if (jogador.getSaldo() < custoAtual) {
      socket.emit("erro", "Saldo insuficiente.");
      return;
    }

    // Registra o novo lance
    this.auctionState.totalBids++;
    this.auctionState.bids.set(
      this.auctionState.totalBids,
      jogador.getUsername(),
    );

    // Se há menos de 2 segundos restantes, estende o tempo
    const agora = Date.now();
    const tempoRestanteReal = this.auctionState.endTime - agora;

    if (tempoRestanteReal < 2000) {
      const TEMPO_EXTRA = 2000; // Adiciona 2 segundos
      this.auctionState.endTime += TEMPO_EXTRA;

      if (this.auctionState.timer) clearTimeout(this.auctionState.timer);

      const novoTempoRestante = this.auctionState.endTime - Date.now();
      this.agendarFimDoLeilao(novoTempoRestante);

      // Notifica os jogadores que o tempo foi estendido
      this.io.emit("leilaoTempoEstendido", {
        novoTempoRestante: novoTempoRestante,
      });
    }

    // Notifica todos os jogadores sobre o novo lance
    this.io.emit("leilaoNovoLance", {
      username: jogador.getUsername(),
      totalBids: this.auctionState.totalBids,
      valorAtual: custoAtual,
    });
  }

  /**
   * Agenda o término do leilão após uma duração específica
   * @param duracaoMs - Duração em milissegundos
   */
  private agendarFimDoLeilao(duracaoMs: number) {
    this.auctionState.timer = setTimeout(() => {
      this.finalizarLeilao();
    }, duracaoMs);
  }

  /**
   * Finaliza o leilão e determina o vencedor
   * Transfiere a propriedade e credita o banco se houver lances
   * Se ninguém lançou, a propriedade fica disponível
   */
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
  // EMISSORES CENTRALIZADOS
  // ============================

  // ============================
  // METODOS DE SINCRONIZACAO
  // ============================
  // Mantém clientes atualizados com estado do jogo

  /**
   * Envia estado atualizado de um jogador específico
   * @param username - Nome do jogador a atualizar
   */
  private emitPlayerUpdate(username: string) {
    const socketId = Memory.getSocketIdByUsername(username);
    const player = Memory.getPlayerByUsername(username);
    if (!socketId || !player) return;

    // Envia para o próprio jogador
    this.io.to(socketId).emit("playerUpdate", player.toDTO());
  }

  /**
   * Envia dados de todos os jogadores para todos os clientes
   * Atualiza lista de nomes e objetos completos dos jogadores
   */
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

  /**
   * Limpa console e exibe lista atualizada de jogadores conectados
   */
  private atualizarTerminal() {
    console.clear();
    console.log(this.construtorDeConsole());
  }

  /**
   * Envia lista de todas as propriedades para todos os clientes
   * Inclui donos, níveis de construção e multiplicadores
   */
  private emitPropertiesUpdate() {
    const propriedades = Memory.getAllPropertiesByArray();
    this.io.emit("propertiesUpdate", propriedades);
  }

  /**
   * Envia uma mensagem para o histórico pessoal de um jogador
   * Usado para notificações e ações realizadas
   * @param username - Nome do jogador
   * @param mensagem - Mensagem a exibir no histórico
   */
  private emitPersonalHistory(username: string, mensagem: string) {
    const socketId = Memory.getSocketIdByUsername(username);
    if (socketId) {
      this.io.to(socketId).emit("historyIncrement", mensagem);
    }
  }

  // ============================
  // 🔌 REGISTRO DE EVENTOS SOCKET
  // ============================
  // Processa todas as conexões, desconexões e eventos dos clientes

  /**
   * Registra todos os event listeners do Socket.io
   * Coordena: conexão, reconexão, registro, turnos, movimentação, etc
   */
  private registerEvents() {
    this.io.on("connection", (socket: Socket) => {
      // Evento: Jogador faz lance no leilão
      socket.on("auctionDoBid", () => {
        this.processarLance(socket);
      });

      this.atualizarTerminal();

      // Envia versão do jogo para validação no cliente
      socket.emit("checkVersion", gameVersion);

      // Evento: Cliente solicita dados iniciais do tabuleiro
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

      // Evento: Jogador reconecta após desconexão
      socket.on("reconnectPlayer", (username: string) => {
        const player = Memory.getPlayerByUsername(username);

        if (player) {
          // Atualiza o socket ID do jogador
          Memory.updateSocketId(username, socket.id);

          socket.emit("reconnectSuccess", player.toDTO());
          socket.emit("registerSuccess");
          this.atualizarTerminal();
          this.sendAllPlayers();
          this.emitPropertiesUpdate();

          // Envia propriedade atual do jogador
          const propAtual = Memory.getPropriedadeById(player.getPosicao());
          socket.emit("currentRoundData", { propriedade: propAtual });

          this.emitPersonalHistory(
            username,
            `♻️ Você foi reconectado ao jogo.`,
          );

          // Se é o turno do jogador, notifica
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

      // Evento: Novo jogador se registra no jogo
      socket.on("registerPlayer", (rawUsername: string) => {
        const username = rawUsername.trim();
        const playersArray = Array.from(Memory.players.values());
        // Verifica se há uma sessão anterior para este jogador
        const ghostPlayer = playersArray.find((p) => p.username === username);

        if (ghostPlayer) {
          // Jogador retornando - recupera sessão anterior
          console.log(`♻️ Recuperando sessão para: ${username}`);

          // Desconecta socket anterior se ainda existir
          const oldSocketId = Memory.getSocketIdByUsername(username);
          if (oldSocketId) {
            const oldSocket = this.io.sockets.sockets.get(oldSocketId);
            if (oldSocket) oldSocket.disconnect(true);
            Memory.playerBySocketId.delete(oldSocketId);
          }

          // Atualiza socket ID e re-registra
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

      // Evento: Jogador pronto para iniciar o jogo
      socket.on("readyForInit", () => {
        // Se o jogo já está rodando, apenas sincroniza o novo jogador
        if (this.isGameRunning) {
          const username = Memory.getUsernameBySocketId(socket.id)?.username;

          if (username) {
            const player = Memory.getPlayerByUsername(username);
            if (player) {
              const propAtual = Memory.getPropriedadeById(player.getPosicao());
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

        // Adiciona jogador à lista de prontos
        this.readyPlayers.add(username);

        const totalJogadores = Memory.players.size;
        const totalProntos = this.readyPlayers.size;

        // Se todos os jogadores estão prontos, inicia o jogo
        if (totalProntos === totalJogadores && totalJogadores > 0) {
          this.isGameRunning = true;

          const players = Array.from(Memory.players.values());

          // Define o primeiro jogador
          this.currentTurnIndex = 0;
          const firstPlayer = players[0];
          const socketId = Memory.getSocketIdByUsername(firstPlayer.username);

          if (!socketId) return;

          // Inicializa estado global do jogo
          Memory.randomizeWeather();
          Memory.setGlobalHour("dia");
          this.dayTurns = 0;

          this.io.emit("gameStarted");

          this.currentTurnUser = firstPlayer.username;
          this.currentTurnHasRolled = false;

          setTimeout(() => {
            this.io.to(socketId).emit("yourTurn", { hasRolled: false });
            this.io.to(socketId).emit("turn_update", {
              playerDaVez: this.currentTurnUser,
            });
          }, 1000);
          
          this.dadoAtual = Banco.rolarDados();
        }
      });

      // Evento: Jogador não está pronto para iniciar
      socket.on("notReadyForInit", () => {
        const username = Memory.getUsernameBySocketId(socket.id)?.getUsername();
        if (username) {
          this.readyPlayers.delete(username);
        }
      });

      // Evento: Sincronização do estado do jogo
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

      // ============================
      // SISTEMA DE TURNOS
      // ============================

      // Evento: Jogador finaliza seu turno
      socket.on("finishTurn", () => {
        const info = Memory.getUsernameBySocketId(socket.id);
        if (!info) return;

        const players = Array.from(Memory.players.values());
        if (players.length === 0) return;

        // Passa para o próximo jogador
        this.currentTurnIndex = (this.currentTurnIndex + 1) % players.length;

        // ==================== SISTEMA DE JORNAL ====================
        // Gera notícias a cada 5 rodadas completas (todos os jogadores jogaram 5 vezes)
        if (this.currentTurnIndex === 0) {
          this.rodadasTotais++;
          console.log(`🔄 Fim da Rodada ${this.rodadasTotais}`);

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

        // ==================== SISTEMA DIA/NOITE ====================
        // Alterna entre dia e noite a cada rodada completa
        this.dayTurns++;
        const totalJogadores = Memory.players.size;

        if (this.dayTurns >= totalJogadores) {
          this.dayTurns = 0;
          this.isDay = !this.isDay;
          const novoHorario = this.isDay ? "dia" : "noite";

          Memory.setGlobalHour(novoHorario);
          Memory.randomizeWeather();
          this.emitPropertiesUpdate();
        }

        // Notifica o próximo jogador que é sua vez
        this.io.to(nextSocketId).emit("yourTurn", { hasRolled: false });
        this.io.emit("turn_update", { playerDaVez: nextPlayer.username });
        this.currentRound++;

        // ==================== SISTEMA DE LEILÃO ====================
        // Leilão tem 5% de chance de ser aprovado a cada turno
        // Leva 3 turnos para o leilão começar após aprovação
        this.turnosSemLeilao++;
        const sorte = Math.random() < 0.05;

        if ((sorte) && this.leilaoAprovadoTurnos === 0) {
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
      // MOVIMENTACAO E PRISAO
      // ============================

      // Evento: Jogador tenta sair da prisão (rolando dados)
      // Sistema de 3 tentativas: precisa igualar dados ou paga R$250 de multa
      socket.on("tentativaPrisao", ({ d1, d2 }) => {
        const info = Memory.getUsernameBySocketId(socket.id);
        if (!info) return;

        const player = Memory.getPlayerByUsername(info.username);
        if (!player) return;

        // Verifica se conseguiu igualar os dois dados
        const dadosIguais = d1 === d2;

        // Incrementa tentativa se não igualou
        if (!dadosIguais) {
          player.turnosPrisao = (player.turnosPrisao || 0) + 1;
        }

        // Se igualou ou completou 3 tentativas, o jogador sai da prisão
        if (dadosIguais || player.turnosPrisao >= 3) {
          let mensagem = "";

          if (dadosIguais) {
            // Sucesso: dados iguais
            mensagem = "🎉 Você tirou dados iguais e está livre!";
            player.turnosPrisao = 0;
          } else {
            // Falha: após 3 tentativas, paga multa e sai mesmo assim
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

      // Evento: Teste de dado (usado para debug/desenvolvimento)
      socket.on("testDice", () => {
        const username = Memory.getUsernameBySocketId(socket.id)!.getUsername();
        const player = Memory.getPlayerByUsername(username);
        
        // Rola dados
        this.dadoAtual = Banco.rolarDados();
        const posicaoAntiga = player!.getPosicao();

        // Move o jogador sem passar por eventos de propriedade (apenas teste)
        Banco.moverJogador(player!.getUsername(), this.dadoAtual);
        this.sendAllPlayers();
        socket.emit("diceRolled", this.dadoAtual);

        this.emitPersonalHistory(
          username!,
          `🎲 Você tirou ${this.dadoAtual} (Teste).`,
        );

        // Verifica se passou pelo ponto de partida
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

      // Evento: Força libertar um jogador preso (comando admin)
      socket.on("soltarJogador", () => {
        const info = Memory.getUsernameBySocketId(socket.id);
        if (!info) return;

        Banco.soltarJogadorForcado(info.getUsername());
      });

      // ============================
      // GERENCIAMENTO DA PARTIDA
      // ============================

      // Evento: Jogador deixa o jogo
      socket.on("leaveGame", () => {
        const player = Memory.getUsernameBySocketId(socket.id);

        if (!player) return;

        const username = player.getUsername();

        // Recupera todas as propriedades do jogador e as devolve (sem dono)
        // Quando um jogador sai, todas as suas propriedades voltam para o banco
        const propriedadesDoPlayer = player.getPropriedadesId();

        propriedadesDoPlayer.forEach((propId) => {
          const prop = Memory.getPropriedadeById(propId);
          if (prop) {
            prop.setOwner(null);
            prop.level = 0;
          }
        });

        // Remove o jogador do jogo
        Memory.players.delete(username);
        Memory.playerBySocketId.delete(socket.id);

        // Remove da lista de prontos se estava lá
        if (this.readyPlayers.has(username)) {
          this.readyPlayers.delete(username);
        }

        this.atualizarTerminal();

        // Se era a vez dele, passa para o próximo jogador
        if (this.currentTurnUser === username) {
          const remainingPlayers = Array.from(Memory.players.values());

          if (remainingPlayers.length > 0) {
            // Ajusta o índice se necessário
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

        // Se nenhum jogador restou, encerra o jogo
        if (Memory.players.size === 0) {
          this.isGameRunning = false;
          this.readyPlayers.clear();
          this.currentTurnHasRolled = false;
          this.turnosSemLeilao = 0;
          this.rodadasTotais = 0;
        }
      });

      // Evento: Jogador rola dado extra (em certas circunstâncias)
      // Pode resultar em prisão se cair na casa de ir preso
      socket.on("rollDiceByPlayer", () => {
        const info = Memory.getUsernameBySocketId(socket.id);
        const qtd = Banco.rolarDados(); // Rola novo dado
        if (!info) return;

        const player = info;
        const posicaoAntiga = player.getPosicao();

        // Solta o jogador (se estava preso) e o move
        Banco.soltarJogadorForcado(player.getUsername());
        Banco.moverJogador(player.getUsername(), qtd);

        const idAtual = Memory.getPropriedadeById(player.getPosicao())?.getId();

        // Se caiu na casa 30 (Vá para a prisão), vai preso automaticamente
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

        // Verifica se passou pelo ponto de partida (começou)
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

        // Alternativa se movimento foi para trás
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

      // Evento: Movimento manual de um jogador (quantidade específica)
      socket.on("moveByPlayer", (qtd: number) => {
        const info = Memory.getUsernameBySocketId(socket.id);
        if (!info) return;

        const player = info;
        const posicaoAntiga = player.getPosicao();

        // Move o jogador
        Banco.soltarJogadorForcado(player.getUsername());
        Banco.moverJogador(player.getUsername(), qtd);

        const idAtual = Memory.getPropriedadeById(player.getPosicao())?.getId();

        // Verifica se caiu na casa de prisão
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

        // Verifica passagem pelo ponto de partida
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

      // Evento: Adicionar dinheiro a um jogador (comando de teste/admin)
      socket.on("getMoneyByPlayer", (qtd: number) => {
        const info = Memory.getUsernameBySocketId(socket.id);
        if (!info) return;

        // Aumenta o saldo do jogador
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

      // ============================
      // SISTEMA DE TRANSACOES
      // ============================

      // Evento: Rolar dado (evento genérico)
      // Apenas um rolo por turno permitido
      socket.on("rollDice", () => {
        const info = Memory.getUsernameBySocketId(socket.id);
        if (!info) return;

        // Verifica se já rolou neste turno
        if (this.currentTurnHasRolled) return;

        const player = Memory.getPlayerByUsername(info.username);
        if (!player) return;

        // Se está preso, não pode rolar
        if (player.getPreso()) {
          socket.emit("Jailled");
          return;
        }

        // Rola e move
        this.dadoAtual = Banco.rolarDados();
        this.currentTurnHasRolled = true;

        const posicaoAntiga = player.getPosicao();

        Banco.moverJogador(info.username, this.dadoAtual);

        // Verifica se caiu na casa de ir preso
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

        // Verifica bônus de passagem pelo ponto de partida
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

      // Evento: Enviar recibo de transação (log visual)
      socket.on(
        "receipt",
        (data: { remetente: string; valor: number; destinatario: string }) => {
          const currentSocket = Memory.getSocketIdByUsername(data.remetente);
          if (currentSocket) {
            this.io.to(currentSocket).emit("transactionReceipt", data);
          }
        },
      );

      // Evento: Transação de máquina (compra de cartas, etc)
      socket.on(
        "cardThrowed",
        (data: { remetente: string; valor: number; destinatario: string }) => {
          this.io.emit("machineTransaction", data);
        },
      );

      // Evento: Comprar uma propriedade
      socket.on("buyProperty", (id: number) => {
        const info = Memory.getUsernameBySocketId(socket.id);
        if (!info) return;

        // Tenta comprar a propriedade
        const result = Banco.comprarPropriedade(id, info.username);
        const propriedadesArray = Memory.getAllPropertiesByArray();
        
        // Notifica todos sobre a atualização de propriedades
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

      // Evento: Transação de propriedade entre jogadores
      socket.on("propertyTransaction", (id: number) => {
        const info = Memory.getUsernameBySocketId(socket.id);
        if (!info) return;

        const propriedade = Memory.getPropriedadeById(id);
        if (!propriedade) return;

        const donoAnterior = propriedade.getOwner();
        
        // Transfere propriedade
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

      // Evento: Pagamento ao banco (fiança, impostos)
      socket.on("bankPayment", (valor: number) => {
        const info = Memory.getUsernameBySocketId(socket.id);
        if (!info) return;

        // Processa pagamento ao banco
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

      // Evento: Resgate de ponto de partida (bônus por volta completa)
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

      // ============================
      // SISTEMA DE CARTAS
      // ============================

      // Evento: Buscar mensagem de carta aleatória (do AI)
      socket.on("getMessage", async () => {
        const info = Memory.getUsernameBySocketId(socket.id)?.getUsername();
        if (!info) return;
        
        // Gera mensagem de carta usando AI
        const mensagem = await Carta.getCardRandomly(info);

        socket.emit("aiMessage", mensagem.mensagemPrivada);
        socket.emit("publicAiMessage", mensagem.mensagemPublica);

        this.sendAllPlayers();

        this.emitPersonalHistory(
          info,
          `🃏 Carta: "${mensagem.mensagemPublica}"`,
        );
      });

      // Evento: Transferir propriedade para outro jogador
      socket.on(
        "transferPropertyToPlayer",
        ({ propertyId, targetUsername }) => {
          const info = Memory.getUsernameBySocketId(socket.id);
          const targetObject = Memory.getPlayerByUsername(targetUsername);
          if (!info) return;

          const propriedade = Memory.getPropriedadeById(propertyId);
          if (!propriedade) return;

          // Verifica se é o dono
          if (propriedade.getOwner() !== info.username) {
            return;
          }

          // Transfere a propriedade
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

      // Evento: Transação monetária entre jogadores
      // Permite enviar dinheiro para outro jogador ou banco
      socket.on(
        "playerTransaction",
        (destinyUsername: string, valor: number) => {
          const senderPlayer = Memory.getUsernameBySocketId(socket.id);
          if (!senderPlayer) return;

          const sendingUsername = senderPlayer.getUsername();
          
          // Se é para o banco, deduz diretamente
          if (destinyUsername === "Banco") {
            senderPlayer.deduzirSaldo(valor);
            socket.emit("playerTrasactionResult", true);
          }
          
          // Obtém socket do destinatário
          const destinySocket = Memory.getSocketIdByUsername(destinyUsername);

          // Realiza a transação
          const resultado = Banco.transacaoMonetaria(
            valor,
            sendingUsername,
            destinyUsername,
          );

          // Notifica o destinatário
          if (destinySocket) {
            this.io.to(destinySocket).emit("notification", resultado.msgPara);
          }
          socket.emit("playerTransactionResult", resultado);

          this.emitPlayerUpdate(sendingUsername);
          this.emitPlayerUpdate(destinyUsername);
          this.sendAllPlayers();
          this.emitPropertiesUpdate();

          // Registra no histórico
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

      // Evento: Pagamento de aluguel entre jogadores
      // Parecido com playerTransaction mas registra a propriedade alvo
      socket.on(
        "playerRentPay",
        (destinyUsername: string, valor: number, propriedadeId: number) => {
          const senderPlayer = Memory.getUsernameBySocketId(socket.id);
          if (!senderPlayer) return;

          const sendingUsername = senderPlayer.getUsername();
          
          // Se é para o banco, deduz diretamente
          if (destinyUsername === "Banco") {
            senderPlayer.deduzirSaldo(valor);
            socket.emit("playerTrasactionResult", true);
          }
          
          // Obtém socket do destinatário
          const destinySocket = Memory.getSocketIdByUsername(destinyUsername);

          // Realiza a transação
          const resultado = Banco.transacaoMonetaria(
            valor,
            sendingUsername,
            destinyUsername,
          );

          // Notifica o destinatário
          if (destinySocket) {
            this.io.to(destinySocket).emit("notification", resultado.msgPara);
          }
          socket.emit("playerTransactionResult", resultado);

          // Se bem-sucedido, registra o pagamento e adiciona capital à propriedade
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

      // Evento: Vender propriedade ao banco
      // Retorna 80% do valor original
      socket.on("sellToBank", (id: number) => {
        const username = Memory.getUsernameBySocketId(socket.id)?.getUsername();
        if (!username) return;

        // Tenta vender a propriedade ao banco
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

          // Notifica atualização de propriedades
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

      // Evento: Aumentar nível de uma propriedade (construção)
      socket.on("upgradeProperty", (data) => {
        const username = Memory.getUsernameBySocketId(socket.id)?.getUsername();
        if (!username) return;

        // Aumenta o nível da propriedade
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

      // Evento: Diminuir nível de uma propriedade (demolição)
      socket.on("downgradeProperty", (data) => {
        const username = Memory.getUsernameBySocketId(socket.id)?.getUsername();
        if (!username) return;

        // Diminui o nível da propriedade
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

      // Evento: Desconexão do cliente
      // Não precisa fazer nada especial, apenas log
      socket.on("disconnect", () => {
        // console.log(`Socket desconectado: ${socket.id}`);
      });
    });
  }
}
