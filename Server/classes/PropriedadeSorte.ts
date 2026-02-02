import { Propriedade } from "./Propriedade";

/**
 * Classe PropriedadeSorte - Representa uma casa de sorte/azar no tabuleiro
 * Quando um jogador cai nesta casa, uma carta de sorte ou azar é executada
 * Pode ter efeitos financeiros ou de movimentação
 */
export class PropriedadeSorte extends Propriedade {
    private jogador: string | null = null; // Jogador que tirou a carta (não utilizado atualmente)

    /**
     * Construtor da propriedade de sorte
     * @param id - ID único da propriedade
     * @param nome - Nome descritivo (ex: "Sorte")
     * @param color - Cor/grupo da propriedade (padrão: "sorte")
     */
    constructor(id: number, nome: string, color: string = "sorte") {
        super(id, nome, "#484d50", color, null, null, null);
    }

    /**
     * Gera uma mensagem para exibir ao jogador que tirou a carta
     * @param jogador - Username do jogador
     * @returns Mensagem descritiva (não implementado)
     */
    gerarMensagem(jogador: string): string {
        return "";
    }

    /**
     * Propriedades de sorte não sofrem eventos aleatórios
     */
    override generateRandomEvent(): void {
        // Sortes não sofrem eventos
    }
}