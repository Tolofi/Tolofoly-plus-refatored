import { Propriedade } from "./Propriedade";

/**
 * Classe PropriedadeTaxa - Representa uma casa de taxas no tabuleiro
 * Quando um jogador cai nesta propriedade, deve pagar uma taxa fixa
 * Não pode ser comprada nem construída
 */
export class PropriedadeTaxa extends Propriedade {
    private taxAmount: number; // Valor da taxa a pagar

    /**
     * Construtor da propriedade de taxa
     * @param id - ID único da propriedade
     * @param nome - Nome descritivo (ex: "Imposto de Renda")
     * @param taxaAmount - Valor da taxa a ser cobrada
     * @param color - Cor/grupo da propriedade (padrão: "Taxa")
     */
    constructor(id: number, nome: string, taxaAmount: number, color: string = "Taxa") {
        super(id, nome, "#808080", color, null, null, null);
        this.taxAmount = taxaAmount;
    }

    /**
     * Propriedades de taxa não sofrem eventos aleatórios
     */
    override generateRandomEvent(): void {
        // Taxas não sofrem eventos
    }
}