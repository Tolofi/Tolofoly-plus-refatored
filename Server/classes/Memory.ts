import { PropriedadeSorte } from "./PropriedadeSorte";
import { PropriedadeCompanhia } from "./PropriedadeCompanhia";
import { Player } from "./Player";
import { Propriedade } from "./Propriedade";
import { PropriedadeTaxa } from "./PropriedadeTaxa";
import { PropriedadeEstacao } from "./PropriedadeEstacao";
import { PropriedadeNula } from "./PropriedadeNula";

/**
 * Classe Memory - Gerenciador central de estado do jogo
 * Mantém registro de todos os jogadores, propriedades e suas relações
 * Armazena dados em memória RAM para acesso rápido durante o jogo
 */
export class Memory {
  static isPropertyInitialized: boolean = false;

  // Mapa principal: Username -> Objeto Player
  // Permite buscar dados do jogador pelo seu nome de usuário
  static players: Map<string, Player> = new Map();

  // Mapa reverso: SocketID -> Username
  // Permite identificar qual jogador enviou uma mensagem via WebSocket
  static playerBySocketId: Map<string, string> = new Map();

  // Mapa de propriedades: ID -> Objeto Propriedade
  // Todas as propriedades do tabuleiro com seus dados
  static propriedades: Map<number, Propriedade> = new Map();

  /**
   * Busca um jogador pelo seu ID de conexão WebSocket
   * @param socketId - ID da conexão
   * @returns Objeto Player ou null se não encontrado
   */
  static getUsernameBySocketId(socketId: string): Player | null {
    const username = this.playerBySocketId.get(socketId);
    const player = username ? this.players.get(username) : null;
    return player || null;
  }

  /**
   * Busca o ID de conexão de um jogador pelo nome de usuário
   * @param username - Nome do jogador
   * @returns ID do socket ou null
   */
  static getSocketIdByUsername(username: string): string | null {
    const player = this.players.get(username);
    return player ? player.socketId : null;
  }

  /**
   * Registra um novo jogador no jogo
   * Cria entrada tanto no mapa principal quanto no mapa reverso
   * @param socketId - ID da conexão WebSocket
   * @param username - Nome do jogador
   * @returns true se registrado com sucesso, false se usuário já existe
   */
  static registerPlayer(socketId: string, username: string): boolean {
    if (!this.players.has(username)) {
      const newPlayer = new Player(this.players.size + 1, username, socketId);
      Memory.players.set(username, newPlayer);
      Memory.playerBySocketId.set(socketId, username);
      return true;
    }
    return false;
  }

  /**
   * Atualiza o estado climático de todas as propriedades
   * Decrementa duração de eventos ativos, gera novos eventos e aplica clima
   * Afeta o multiplicador de aluguel das propriedades
   */
  static randomizeWeather() {
    this.propriedades.forEach((prop: Propriedade) => {
      // 1. Decrementa a duração de eventos anteriores
      prop.decreaseEventDuration();

      // 2. Tenta gerar novos eventos (Obra, Carnaval, etc)
      // Se um evento for gerado, ele define automaticamente o multiplicador
      prop.generateRandomEvent();

      // 3. Aplica o clima da propriedade (apenas se método existir)
      if ("randomWeather" in prop && typeof prop.randomWeather === "function") {
        prop.randomWeather(); // Sorteia aleatoriamente: stormy, rainy ou clear

        // Clima afeta principalmente ESTAÇÕES
        if (prop.getColor() === "Estacao") {
          if (prop.getWeather() === "stormy") {
            // Tempestade penaliza: voos cancelados, poucos viajantes
            prop.setRentMultiplier(0.8);
            prop.setAlertMessage("Voos cancelados! -20%(aluguel)");
          }
          // Se céu limpo ou chuva leve, volta ao normal (se não há evento ativo)
          else if (
            prop.getWeather() === "clear" ||
            prop.getWeather() === "rainy"
          ) {
            // Só reseta se NÃO tiver um evento de prefeitura/festa/etc
            if (prop.eventDuration === 0) {
              prop.setRentMultiplier(1);
              prop.setAlertMessage("");
            }
          }
        }
        // Propriedades normais não são afetadas por clima, apenas por eventos
      }

      // Log de eventos ativos para debug
      if (prop.eventDuration > 0) {
        console.log(
          `Propriedade ${prop.getName()} (${prop.getId()}) está com evento ativo: ${prop.alertMessage}`,
        );
      }
    });
  }

  /**
   * Define o período do dia (dia ou noite) para todas as propriedades
   * Pode ser usado para criar dinâmica horária no jogo
   * @param hour - "dia" ou "noite"
   */
  static setGlobalHour(hour: "dia" | "noite") {
    this.propriedades.forEach((prop) => {
      // Verifica se o método existe antes de chamar
      if ("setHour" in prop && typeof (prop as any).setHour === "function") {
        (prop as any).setHour(hour);
      }
    });
  }

  /**
   * Busca um jogador pelo nome de usuário
   * @param username - Nome do jogador
   * @returns Objeto Player ou null
   */
  static getPlayerByUsername(username: string): Player | null {
    return this.players.get(username) || null;
  }

  /**
   * Busca uma propriedade pelo seu ID
   * @param id - ID da propriedade
   * @returns Objeto Propriedade ou null
   */
  static getPropriedadeById(id: number): Propriedade | null {
    return this.propriedades.get(id) || null;
  }

  /**
   * Retorna todas as propriedades como um array
   * @returns Array com todas as propriedades
   */
  static getAllPropertiesByArray(): Propriedade[] {
    return Array.from(this.propriedades.values());
  }

  /**
   * Retorna os nomes de todos os jogadores ativos
   * @returns Array com usernames dos jogadores
   */
  static getAllPlayerUsernameByArray(): string[] {
    return Array.from(this.players.keys());
  }

  /**
   * Atualiza o ID de conexão de um jogador
   * Útil quando um jogador se reconecta com um novo socket
   * @param username - Nome do jogador
   * @param newSocketId - Novo ID de conexão
   */
  public static updateSocketId(username: string, newSocketId: string) {
    const player = this.players.get(username);

    if (player) {
      const oldSocketId = player.socketId;

      // Remove a entrada antiga do mapa reverso
      if (oldSocketId && this.playerBySocketId.has(oldSocketId)) {
        this.playerBySocketId.delete(oldSocketId);
      }

      // Atualiza para o novo socket
      player.socketId = newSocketId;
      this.playerBySocketId.set(newSocketId, username);
    }
  }

  /**
   * Inicializa todas as propriedades do tabuleiro
   * Criação de 40 propriedades em 8 grupos temáticos
   * Inclui: terrenos, estações, companhias, taxas e cartas de sorte
   * Executa apenas uma vez por sessão de jogo
   */
  static initializeProperties(): void {
    if (this.isPropertyInitialized) {
      return;
    }

    let i = 0;

    // ==================== GRUPO 1 - MARROM ====================
    Memory.propriedades.set(
      i++,
      new PropriedadeNula(i, "Ponto de Partida", "Comeco", "#008000"),
    );
    Memory.propriedades.set(
      i++,
      new Propriedade(i, "Av. Sumaré", "#8B4513", "Marrom", 500, 20, 600),
    );
    Memory.propriedades.set(
      i++,
      new PropriedadeCompanhia(i, "Companhia de Saneamento Básico"),
    );
    Memory.propriedades.set(
      i++,
      new Propriedade(i, "Praça da Sé", "#8B4513", "Marrom", 500, 40, 600),
    );
    Memory.propriedades.set(
      i++,
      new PropriedadeTaxa(i, "Imposto de Renda", 2000),
    );
    Memory.propriedades.set(
      i++,
      new PropriedadeSorte(i, "Via De Pedestres", "Sorte"),
    );

    // ==================== GRUPO 2 - AZUL CLARO ====================
    Memory.propriedades.set(
      i++,
      new Propriedade(
        i,
        "Rua 25 de Março",
        "#94bdcaff",
        "Azul Claro",
        500,
        60,
        1000,
      ),
    );
    Memory.propriedades.set(
      i++,
      new PropriedadeEstacao(i, "Aeroporto de Confins"),
    );
    Memory.propriedades.set(
      i++,
      new Propriedade(
        i,
        "Av. São João",
        "#94bdcaff",
        "Azul Claro",
        500,
        60,
        1000,
      ),
    );
    Memory.propriedades.set(
      i++,
      new Propriedade(
        i,
        "Av. Paulista",
        "#94bdcaff",
        "Azul Claro",
        500,
        80,
        1200,
      ),
    );
    Memory.propriedades.set(
      i++,
      new PropriedadeNula(i, "Prisão (Visitante)", "Visitante", "#ffc067"),
    );

    // ==================== GRUPO 3 - ROSA ====================
    Memory.propriedades.set(
      i++,
      new Propriedade(
        i,
        "Av. Vieira Souto",
        "#FF69B4",
        "Rosa",
        1000,
        100,
        1400,
      ),
    );
    Memory.propriedades.set(
      i++,
      new PropriedadeCompanhia(i, "Companhia de Telecomunicação"),
    );
    Memory.propriedades.set(
      i++,
      new Propriedade(i, "Niterói", "#FF69B4", "Rosa", 1000, 100, 1400),
    );
    Memory.propriedades.set(
      i++,
      new Propriedade(i, "Av. Atlântica", "#FF69B4", "Rosa", 1000, 120, 1600),
    );
    Memory.propriedades.set(
      i++,
      new PropriedadeSorte(i, "Via De Bicicletas", "Sorte"),
    );

    // ==================== GRUPO 4 - LARANJA ====================
    Memory.propriedades.set(
      i++,
      new Propriedade(
        i,
        "Av. Pres. Juscelino Kubitschek",
        "#FFA500",
        "Laranja",
        1000,
        140,
        1800,
      ),
    );
    Memory.propriedades.set(i++, new PropriedadeEstacao(i, "Aeroporto Galeão"));
    Memory.propriedades.set(
      i++,
      new Propriedade(
        i,
        "Av. Eng. Luís Carlos Berrini",
        "#FFA500",
        "Laranja",
        1000,
        140,
        1800,
      ),
    );
    Memory.propriedades.set(
      i++,
      new Propriedade(
        i,
        "Av. Brig. Faria Lima",
        "#FFA500",
        "Laranja",
        1000,
        160,
        2000,
      ),
    );
    Memory.propriedades.set(
      i++,
      new PropriedadeNula(
        i,
        "Estacionamento Grátis",
        "Estacionamento",
        "#ffc087",
      ),
    );

    // ==================== GRUPO 5 - VERMELHO ====================
    Memory.propriedades.set(
      i++,
      new Propriedade(i, "Ipanema", "#FF0000", "Vermelho", 1500, 180, 2200),
    );
    Memory.propriedades.set(
      i++,
      new PropriedadeCompanhia(i, "Companhia de Gás"),
    );
    Memory.propriedades.set(
      i++,
      new Propriedade(i, "Leblon", "#FF0000", "Vermelho", 1500, 180, 2200),
    );
    Memory.propriedades.set(
      i++,
      new Propriedade(i, "Copacabana", "#FF0000", "Vermelho", 1500, 200, 2400),
    );
    Memory.propriedades.set(
      i++,
      new PropriedadeSorte(i, "Via De Automóveis", "Sorte"),
    );

    // ==================== GRUPO 6 - AMARELO ====================
    Memory.propriedades.set(
      i++,
      new Propriedade(
        i,
        "Av. Cidade Jardim",
        "#FFFF00",
        "Amarelo",
        1500,
        220,
        2600,
      ),
    );
    Memory.propriedades.set(
      i++,
      new Propriedade(i, "Pacaembu", "#FFFF00", "Amarelo", 1500, 220, 2600),
    );
    Memory.propriedades.set(
      i++,
      new PropriedadeEstacao(i, "Aeroporto de Guarulhos"),
    );
    Memory.propriedades.set(
      i++,
      new Propriedade(i, "Ibirapuera", "#FFFF00", "Amarelo", 1500, 200, 2800),
    );
    Memory.propriedades.set(
      i++,
      new PropriedadeNula(i, "Vá para a Cadeia", "Prisao", "#111184"),
    );

    // ==================== GRUPO 7 - VERDE ====================
    Memory.propriedades.set(
      i++,
      new Propriedade(
        i,
        "Barra da Tijuca",
        "#008000",
        "Verde",
        2000,
        260,
        3000,
      ),
    );
    Memory.propriedades.set(
      i++,
      new Propriedade(
        i,
        "Jardim Botânico",
        "#008000",
        "Verde",
        2000,
        260,
        3000,
      ),
    );
    Memory.propriedades.set(
      i++,
      new PropriedadeEstacao(i, "Aeroporto de Viracopos"),
    );
    Memory.propriedades.set(
      i++,
      new Propriedade(
        i,
        "Lagoa Rodrigo De Freitas",
        "#008000",
        "Verde",
        2000,
        280,
        3200,
      ),
    );
    Memory.propriedades.set(
      i++,
      new PropriedadeSorte(i, "Via Espacial", "Sorte"),
    );

    // ==================== GRUPO 8 - AZUL ESCURO ====================
    Memory.propriedades.set(
      i++,
      new PropriedadeCompanhia(i, "Companhia Elétrica"),
    );
    Memory.propriedades.set(
      i++,
      new Propriedade(i, "Av. Morumbi", "#1C4E9A", "Azul", 2000, 350, 3500),
    );
    Memory.propriedades.set(
      i++,
      new PropriedadeTaxa(i, "Taxa De Riqueza", 1000),
    );
    Memory.propriedades.set(
      i++,
      new Propriedade(
        i,
        "Rua Oscar Freire",
        "#1C4E9A",
        "Azul",
        2000,
        500,
        4000,
      ),
    );

    // Garantia de integridade: injeta o ID correto em cada propriedade
    Memory.propriedades.forEach((prop, keyId) => {
      prop.id = keyId;
    });

    this.isPropertyInitialized = true;
  }
}
