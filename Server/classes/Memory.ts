import { PropriedadeSorte } from "./PropriedadeSorte";
import { PropriedadeCompanhia } from "./PropriedadeCompanhia";
import { Player } from "./Player";
import { Propriedade } from "./Propriedade";
import { PropriedadeTaxa } from "./PropriedadeTaxa";
import { PropriedadeEstacao } from "./PropriedadeEstacao";
import { PropriedadeNula } from "./PropriedadeNula";

export class Memory {
  static isPropertyInitialized: boolean = false;

  // Mapa principal: Username -> Objeto Player
  static players: Map<string, Player> = new Map();

  // Mapa reverso: SocketID -> Username (usado para encontrar quem mandou a mensagem)
  static playerBySocketId: Map<string, string> = new Map();

  static propriedades: Map<number, Propriedade> = new Map();

  static getUsernameBySocketId(socketId: string): Player | null {
    const username = this.playerBySocketId.get(socketId);
    const player = username ? this.players.get(username) : null;
    return player || null;
  }

  static getSocketIdByUsername(username: string): string | null {
    const player = this.players.get(username);
    return player ? player.socketId : null;
  }

  static registerPlayer(socketId: string, username: string): boolean {
    if (!this.players.has(username)) {
      const newPlayer = new Player(this.players.size + 1, username, socketId);
      Memory.players.set(username, newPlayer);
      Memory.playerBySocketId.set(socketId, username);
      return true;
    }
    return false;
  }

  // --- IMPLEMENTAÇÃO 1: Define o clima aleatório para todas as propriedades ---
  static randomizeWeather() {
    this.propriedades.forEach((prop) => {
      // Verifica se o método existe antes de chamar (segurança)
      // assumindo que suas classes de Propriedade possuem esse método
      if (
        "randomWeather" in prop &&
        typeof (prop as any).randomWeather === "function"
      ) {
        (prop as any).randomWeather();
      }
    });
  }

  // --- IMPLEMENTAÇÃO 2: Define o dia/noite para todas as propriedades ---
  static setGlobalHour(hour: "dia" | "noite") {
    this.propriedades.forEach((prop) => {
      // Verifica se o método existe antes de chamar
      if ("setHour" in prop && typeof (prop as any).setHour === "function") {
        (prop as any).setHour(hour);
      }
    });
  }

  static getPlayerByUsername(username: string): Player | null {
    return this.players.get(username) || null;
  }

  static getPropriedadeById(id: number): Propriedade | null {
    return this.propriedades.get(id) || null;
  }

  static getAllPropertiesByArray(): Propriedade[] {
    return Array.from(this.propriedades.values());
  }

  static getAllPlayerUsernameByArray(): string[] {
    return Array.from(this.players.keys());
  }

  public static updateSocketId(username: string, newSocketId: string) {
    const player = this.players.get(username);

    if (player) {
      const oldSocketId = player.socketId;

      if (oldSocketId && this.playerBySocketId.has(oldSocketId)) {
        this.playerBySocketId.delete(oldSocketId);
      }

      player.socketId = newSocketId;
      this.playerBySocketId.set(newSocketId, username);
    }
  }

  static initializeProperties(): void {
    if (this.isPropertyInitialized) {
      return;
    }

    let i = 0;

    // --- GRUPO 1 ---
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

    // --- GRUPO 2 ---
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
    ); // ID 9
    Memory.propriedades.set(
      i++,
      new PropriedadeNula(i, "Prisão (Visitante)", "Visitante", "#ffc067"),
    ); // ID 10

    // --- GRUPO 3 ---
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
    // CORREÇÃO: Renomeado de "Av. Paulista" para "Av. Brasil" para evitar conflito de nomes
    Memory.propriedades.set(
      i++,
      new Propriedade(i, "Av. Atlântica", "#FF69B4", "Rosa", 1000, 120, 1600),
    );
    Memory.propriedades.set(
      i++,
      new PropriedadeSorte(i, "Via De Bicicletas", "Sorte"),
    );

    // --- GRUPO 4 ---
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

    // --- GRUPO 5 ---
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

    // --- GRUPO 6 ---
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

    // --- GRUPO 7 ---
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

    // --- GRUPO 8 ---
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

    // --- PASSO CRÍTICO: GARANTIA DE INTEGRIDADE ---
    // Injeta o ID correto em cada objeto baseado na chave do Map
    Memory.propriedades.forEach((prop, keyId) => {
      prop.id = keyId;
    });

    this.isPropertyInitialized = true;
  }
}
