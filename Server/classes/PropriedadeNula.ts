import { Propriedade } from "./Propriedade";

/**
 * Classe PropriedadeNula - Representa propriedades neutras do tabuleiro
 * Inclui casas como "Ponto de Partida", "Ir para a Cadeia", etc.
 * Não podem ser compradas e não geram aluguel
 */
export class PropriedadeNula extends Propriedade {
  /**
   * Construtor da propriedade nula
   * @param id - ID único da propriedade
   * @param nome - Nome descritivo (ex: "Ponto de Partida")
   * @param color - Cor/grupo da propriedade
   * @param themeColor - Cor para exibição
   */
  constructor(id: number, nome: string, color: string, themeColor: string) {
    super(id, nome, themeColor, color, null, null, null);
  }

  /**
   * Propriedades nulas não sofrem eventos aleatórios
   */
  override generateRandomEvent(): void {
    // Propriedades nulas não sofrem eventos
  }
}
