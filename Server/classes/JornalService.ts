import { Memory } from "./Memory";
import { MANCHETES } from "./JornalData";
import { Player } from "./Player";
import { Propriedade } from "./Propriedade";

export class JornalService {
  private static ultimaCategoria: string = "";
  private static ultimaMancheteIndex: number = -1;

  static gerarEdicao(): { titulo: string; corpo: string; player?: string } {
    const players = Array.from(Memory.players.values());
    const props = Memory.getAllPropertiesByArray();

    if (players.length === 0)
      return { titulo: "JORNAL FECHADO", corpo: "Sem notícias." };

    // --- 1. COLETA DE DADOS ---
    // Convertemos para Number() para garantir a comparação correta
    const maisRico = players.reduce((p, c) =>
      Number(p.getSaldo()) > Number(c.getSaldo()) ? p : c,
    );
    const maisPobre = players.reduce((p, c) =>
      Number(p.getSaldo()) < Number(c.getSaldo()) ? p : c,
    );
    const maisPreso = players.find((p) => p.preso === true);

    const colecionador = players.reduce((p, c) =>
      p.getPropriedadesId().length > c.getPropriedadesId().length ? p : c,
    );

    // --- 2. ANÁLISE PROFUNDA ---
    let categoria = "NORMAL";
    let protagonista = players[Math.floor(Math.random() * players.length)];
    let valorExtra = "";

    const chance = Math.random();

    // A) Checagens de Estado
    const playerAtual = protagonista;
    const propAtual = Memory.getPropriedadeById(playerAtual.getPosicao());
    const corAtual = propAtual ? propAtual.getColor() : "";

    if (corAtual === "Sorte" && chance > 0.8) {
      categoria = "SORTUDO";
      protagonista = playerAtual;
    } else if (
      ["Visitante", "Estacionamento"].includes(corAtual) &&
      chance > 0.8
    ) {
      categoria = "TURISTA";
      protagonista = playerAtual;
    }

    // B) Checagens de Portfólio
    else if (
      this.temAeroportos(colecionador.getUsername(), props) &&
      chance > 0.7
    ) {
      categoria = "BARAO_AEREO";
      protagonista = colecionador;
    } else if (
      this.temElite(colecionador.getUsername(), props) &&
      chance > 0.6
    ) {
      categoria = "ELITE";
      protagonista = colecionador;
    } else if (
      this.temSucata(colecionador.getUsername(), props) &&
      chance > 0.6
    ) {
      categoria = "REI_DA_SUCATA";
      protagonista = colecionador;
    }

    // C) Comportamento
    else if (this.temMonopolio(colecionador.getUsername(), props)) {
      categoria = "MONOPOLISTA";
      protagonista = colecionador;
    } else if (this.calcularNiveis(colecionador.getUsername(), props) > 3) {
      categoria = "CONSTRUTOR";
      protagonista = colecionador;
    } else if (colecionador.getPropriedadesId().length > 5) {
      categoria = "COLECIONADOR";
      protagonista = colecionador;
    } else if (
      Number(maisRico.getSaldo()) > 2000 &&
      maisRico.getPropriedadesId().length <= 1
    ) {
      categoria = "ESPECULADOR";
      protagonista = maisRico;
    } else if (
      colecionador.getPropriedadesId().length >= 3 &&
      Number(colecionador.getSaldo()) < 100
    ) {
      categoria = "ALAVANCADO";
      protagonista = colecionador;
    } else if (
      players.some((p) => p.getPropriedadesId().length === 0) &&
      props.filter((p) => p.getOwner()).length > 10
    ) {
      const semTeto = players.find((p) => p.getPropriedadesId().length === 0);
      if (semTeto) {
        categoria = "SEM_TETO";
        protagonista = semTeto;
      }
    }

    // D) Fallbacks
    else if (maisPreso) {
      categoria = "PRESIDIARIO";
      protagonista = maisPreso;
    } else if (Number(maisRico.getSaldo()) > 3000) {
      categoria = "RICO";
      protagonista = maisRico;
      // FIX: Força Number antes do toFixed
      valorExtra = Number(maisRico.getSaldo()).toFixed(0);
    } else if (Number(maisPobre.getSaldo()) < 200) {
      categoria = "POBRE";
      protagonista = maisPobre;
    }

    if (categoria === this.ultimaCategoria && categoria !== "NORMAL") {
      categoria = "NORMAL";
    }

    // --- 3. MONTAGEM ---
    const opcoes = MANCHETES[categoria] || MANCHETES["NORMAL"];
    let index = Math.floor(Math.random() * opcoes.length);

    if (index === this.ultimaMancheteIndex && opcoes.length > 1) {
      index = (index + 1) % opcoes.length;
    }

    this.ultimaCategoria = categoria;
    this.ultimaMancheteIndex = index;

    const template = opcoes[index];

    // FIX: Força Number antes do toFixed para evitar o crash
    const saldoFormatado =
      valorExtra || Number(protagonista.getSaldo()).toFixed(0);

    const corpoFormatado = template.corpo
      .replace(/\${nome}/g, protagonista.getUsername())
      .replace(/\${saldo}/g, saldoFormatado);

    return {
      titulo: template.titulo,
      corpo: corpoFormatado,
      player: protagonista.getUsername(),
    };
  }

  // --- HELPERS ---

  private static calcularNiveis(
    username: string,
    todasProps: Propriedade[],
  ): number {
    return todasProps
      .filter((p) => p.getOwner() === username)
      .reduce((acc, curr) => acc + (curr.level || 0), 0);
  }

  private static temMonopolio(
    username: string,
    todasProps: Propriedade[],
  ): boolean {
    const propsDoPlayer = todasProps.filter((p) => p.getOwner() === username);
    const coresCount: { [key: string]: number } = {};

    propsDoPlayer.forEach((p) => {
      const cor = p.getColor();
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

    for (const [cor, qtd] of Object.entries(coresCount)) {
      if ((cor === "Marrom" || cor === "Azul Claro") && qtd >= 2) return true;
      if (qtd >= 3) return true;
    }
    return false;
  }

  private static temAeroportos(
    username: string,
    todasProps: Propriedade[],
  ): boolean {
    const aeroportos = todasProps.filter(
      (p) => p.getOwner() === username && p.getColor() === "Estacao",
    );
    return aeroportos.length >= 2;
  }

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
