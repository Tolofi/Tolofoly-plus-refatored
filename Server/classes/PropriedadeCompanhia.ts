import { Propriedade } from "./Propriedade";

/**
 * Classe PropriedadeCompanhia - Representa uma companhia de serviços no tabuleiro
 * As companhias têm aluguel variável baseado na quantidade possuída pelo jogador
 * Quanto mais companhias um jogador possui, maior é o aluguel de cada uma
 */
export class PropriedadeCompanhia extends Propriedade {
    /**
     * Construtor da companhia
     * @param id - ID único da companhia
     * @param nome - Nome descritivo (ex: "Companhia de Saneamento")
     * @param color - Cor/grupo da propriedade (padrão: "Companhia")
     */
    constructor(id: number, nome: string, color: string = "Companhia") {
        super(id, nome, "#787878", color, null, null, 1500, [200, 400, 800, 1600]);
    }

    /**
     * Companhias não sofrem eventos aleatórios
     * O aluguel varia apenas pela quantidade possuída
     */
    override generateRandomEvent(): void {
        // Companhias não sofrem eventos
    }

    /**
     * Calcula o aluguel da companhia baseado na quantidade possuída
     * @param numberOfCompanies - Número de companhias que o jogador possui
     * @returns Valor do aluguel a ser cobrado
     */
    override getRent(numberOfCompanies?: number): number | null {
        if (numberOfCompanies === undefined) {
            return null;
        }
        switch (numberOfCompanies) {
            case 1:
                return 200;   // Uma companhia
            case 2:
                return 400;   // Duas companhias
            case 3:
                return 800;   // Três companhias
            case 4:
                return 1600;  // Todas as companhias
            default:
                return null;
        }
    }
}