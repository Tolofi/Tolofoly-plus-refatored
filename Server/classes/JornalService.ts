import { Memory } from "./Memory";
import { MANCHETES } from "./JornalData";
import { Player } from "./Player";
import { Propriedade } from "./Propriedade";

/**
 * Classe JornalService - Gerador de notícias dinâmicas do jogo
 * Analisa o estado dos jogadores e cria manchetes personalizadas
 * As notícias variam baseadas em categorias: Rico, Pobre, Construtor, etc
 */
export class JornalService {
  private static ultimaCategoria: string = ""; // Evita repetir a mesma categoria
  private static ultimaMancheteIndex: number = -1; // Evita repetir a mesma manchete

  /**
   * Gera uma edição do jornal com uma manchete dinâmica
   * Analisa o estado atual do jogo e escolhe uma categoria apropriada
   * @returns Objeto com título, corpo da notícia e jogador protagonista
   */
  static gerarEdicao(): { titulo: string; corpo: string; player?: string } {
    const players = Array.from(Memory.players.values());
    const props = Memory.getAllPropertiesByArray();

    // Retorna mensagem padrão se nenhum jogador estiver ativo
    if (players.length === 0)
      return { titulo: "JORNAL FECHADO", corpo: "Sem notícias." };

    // ==================== 1. COLETA DE DADOS ====================
    // Identifica jogadores com características específicas

    // Jogador com maior saldo
    const maisRico = players.reduce((p, c) =>
      Number(p.getSaldo()) > Number(c.getSaldo()) ? p : c,
    );

    // Jogador com menor saldo
    const maisPobre = players.reduce((p, c) =>
      Number(p.getSaldo()) < Number(c.getSaldo()) ? p : c,
    );

    // Jogador que está na cadeia
    const maisPreso = players.find((p) => p.preso === true);

    // Jogador com mais propriedades
    const colecionador = players.reduce((p, c) =>
      p.getPropriedadesId().length > c.getPropriedadesId().length ? p : c,
    );

    // ==================== 2. ANÁLISE E CATEGORIZAÇÃO ====================
    // Define qual tipo de manchete será exibida baseado no estado do jogo

    let categoria = "NORMAL"; // Categoria padrão
    let protagonista = players[Math.floor(Math.random() * players.length)];
    let valorExtra = "";

    const chance = Math.random();

    // A) Checagens de Localização Atual
    const playerAtual = protagonista;
    const propAtual = Memory.getPropriedadeById(playerAtual.getPosicao());
    const corAtual = propAtual ? propAtual.getColor() : "";

    // Se jogador está em uma casa de sorte
    if (corAtual === "Sorte" && chance > 0.8) {
      categoria = "SORTUDO";
      protagonista = playerAtual;
    } 
    // Se jogador está em zona neutra
    else if (
      ["Visitante", "Estacionamento"].includes(corAtual) &&
      chance > 0.8
    ) {
      categoria = "TURISTA";
      protagonista = playerAtual;
    }

    // B) Checagens de Portfólio de Propriedades
    else if (
      this.temAeroportos(colecionador.getUsername(), props) &&
      chance > 0.7
    ) {
      // Possuidor de múltiplos aeroportos/estações
      categoria = "BARAO_AEREO";
      protagonista = colecionador;
    } else if (
      this.temElite(colecionador.getUsername(), props) &&
      chance > 0.6
    ) {
      // Possuidor das propriedades mais caras
      categoria = "ELITE";
      protagonista = colecionador;
    } else if (
      this.temSucata(colecionador.getUsername(), props) &&
      chance > 0.6
    ) {
      // Possuidor de propriedades baratas
      categoria = "REI_DA_SUCATA";
      protagonista = colecionador;
    }

    // C) Checagens de Comportamento/Estratégia
    else if (this.temMonopolio(colecionador.getUsername(), props)) {
      // Possuidor de monopólio em uma cor
      categoria = "MONOPOLISTA";
      protagonista = colecionador;
    } else if (this.calcularNiveis(colecionador.getUsername(), props) > 3) {
      // Jogador com muitas casas/hotéis
      categoria = "CONSTRUTOR";
      protagonista = colecionador;
    } else if (colecionador.getPropriedadesId().length > 5) {
      // Jogador com muitas propriedades diversas
      categoria = "COLECIONADOR";
      protagonista = colecionador;
    } else if (
      Number(maisRico.getSaldo()) > 2000 &&
      maisRico.getPropriedadesId().length <= 1
    ) {
      // Jogador com dinheiro mas poucas propriedades
      categoria = "ESPECULADOR";
      protagonista = maisRico;
    } else if (
      colecionador.getPropriedadesId().length >= 3 &&
      Number(colecionador.getSaldo()) < 100
    ) {
      // Jogador que gastou muito em construções
      categoria = "ALAVANCADO";
      protagonista = colecionador;
    } else if (
      players.some((p) => p.getPropriedadesId().length === 0) &&
      props.filter((p) => p.getOwner()).length > 10
    ) {
      // Jogador sem nenhuma propriedade enquanto outros dominam
      const semTeto = players.find((p) => p.getPropriedadesId().length === 0);
      if (semTeto) {
        categoria = "SEM_TETO";
        protagonista = semTeto;
      }
    }

    // D) Fallbacks - categorias com critério mais geral
    else if (maisPreso) {
      categoria = "PRESIDIARIO";
      protagonista = maisPreso;
    } else if (Number(maisRico.getSaldo()) > 3000) {
      categoria = "RICO";
      protagonista = maisRico;
      valorExtra = Number(maisRico.getSaldo()).toFixed(0);
    } else if (Number(maisPobre.getSaldo()) < 200) {
      categoria = "POBRE";
      protagonista = maisPobre;
    }

    // Evita repetir a mesma categoria consecutivamente
    if (categoria === this.ultimaCategoria && categoria !== "NORMAL") {
      categoria = "NORMAL";
    }

    // ==================== 3. MONTAGEM DA MANCHETE ====================
    // Seleciona aleatoriamente uma manchete da categoria

    const opcoes = MANCHETES[categoria] || MANCHETES["NORMAL"];
    let index = Math.floor(Math.random() * opcoes.length);

    // Evita repetir a mesma manchete consecutivamente
    if (index === this.ultimaMancheteIndex && opcoes.length > 1) {
      index = (index + 1) % opcoes.length;
    }

    this.ultimaCategoria = categoria;
    this.ultimaMancheteIndex = index;

    const template = opcoes[index];

    // Formata o saldo do protagonista
    const saldoFormatado =
      valorExtra || Number(protagonista.getSaldo()).toFixed(0);

    // Substitui os placeholders na manchete
    const corpoFormatado = template.corpo
      .replace(/\${nome}/g, protagonista.getUsername())
      .replace(/\${saldo}/g, saldoFormatado);

    return {
      titulo: template.titulo,
      corpo: corpoFormatado,
      player: protagonista.getUsername(),
    };
  }

  // ==================== MÉTODOS AUXILIARES ====================

  /**
   * Calcula o número total de níveis (casas/hotéis) de um jogador
   * @param username - Nome do jogador
   * @param todasProps - Array de todas as propriedades
   * @returns Soma de todos os níveis das propriedades do jogador
   */
  private static calcularNiveis(
    username: string,
    todasProps: Propriedade[],
  ): number {
    return todasProps
      .filter((p) => p.getOwner() === username)
      .reduce((acc, curr) => acc + (curr.level || 0), 0);
  }

  /**
   * Verifica se o jogador possui monopólio em alguma cor
   * Monopólio significa possuir todas as propriedades de uma cor
   * @param username - Nome do jogador
   * @param todasProps - Array de todas as propriedades
   * @returns true se possui monopólio, false caso contrário
   */
  private static temMonopolio(
    username: string,
    todasProps: Propriedade[],
  ): boolean {
    const propsDoPlayer = todasProps.filter((p) => p.getOwner() === username);
    const coresCount: { [key: string]: number } = {};

    // Conta quantas propriedades de cada cor o jogador possui
    propsDoPlayer.forEach((p) => {
      const cor = p.getColor();
      // Ignora propriedades especiais (Sorte, Companhias, Estações, etc)
      if (
        cor &&
        ![
          "Sorte",
          "Companhia",
          "Estacao",
          "Prisao",
          "Taxa",
          "Comeco",
          "Visitante",
          "Estacionamento",
        ].includes(cor)
      ) {
        coresCount[cor] = (coresCount[cor] || 0) + 1;
      }
    });

    // Verifica se possui todas as propriedades de alguma cor
    for (const [cor, qtd] of Object.entries(coresCount)) {
      // Cores Marrom e Azul Claro têm apenas 2 propriedades cada
      if ((cor === "Marrom" || cor === "Azul Claro") && qtd >= 2) return true;
      // Outras cores têm 3 propriedades cada
      if (qtd >= 3) return true;
    }
    return false;
  }

  /**
   * Verifica se o jogador possui múltiplos aeroportos/estações
   * @param username - Nome do jogador
   * @param todasProps - Array de todas as propriedades
   * @returns true se possui 2 ou mais estações
   */
  private static temAeroportos(
    username: string,
    todasProps: Propriedade[],
  ): boolean {
    const aeroportos = todasProps.filter(
      (p) => p.getOwner() === username && p.getColor() === "Estacao",
    );
    return aeroportos.length >= 2;
  }

  /**
   * Verifica se o jogador possui propriedades "sucata" (mais baratas)
   * @param username - Nome do jogador
   * @param todasProps - Array de todas as propriedades
   * @returns true se possui 3 ou mais propriedades das cores Marrom/Azul Claro
   */
  private static temSucata(
    username: string,
    todasProps: Propriedade[],
  ): boolean {
    const props = todasProps.filter(
      (p) =>
        p.getOwner() === username &&
        (p.getColor() === "Marrom" || p.getColor() === "Azul Claro"),
    );
    return props.length >= 3;
  }

  /**
   * Verifica se o jogador possui propriedades "elite" (mais caras)
   * @param username - Nome do jogador
   * @param todasProps - Array de todas as propriedades
   * @returns true se possui 2 ou mais propriedades das cores Verde/Azul Escuro
   */
  private static temElite(
    username: string,
    todasProps: Propriedade[],
  ): boolean {
    const props = todasProps.filter(
      (p) =>
        p.getOwner() === username &&
        (p.getColor() === "Verde" || p.getColor() === "Azul"),
    );
    return props.length >= 2;
  }
}
