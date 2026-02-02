import { Propriedade } from "./Propriedade";

/**
 * Classe PropriedadeEstacao - Representa uma estação de transporte no tabuleiro
 * As estações têm aluguel variável baseado na quantidade possuída pelo jogador
 * Quanto mais estações um jogador possui, maior é o aluguel de cada uma
 */
export class PropriedadeEstacao extends Propriedade {
    /**
     * Construtor da estação
     * @param id - ID único da estação
     * @param nome - Nome descritivo (ex: "Estação da Luz")
     * @param color - Cor/grupo da propriedade (padrão: "Estacao")
     */
    constructor(id: number, nome: string, color: string = "Estacao") {
        super(id, nome, "#787878", color, null, null, 2000, [250 , 500, 1000, 2000]);
    }

    /**
     * Estações não sofrem eventos aleatórios
     * Somente clima (para estações) pode modificar o aluguel
     */
    override generateRandomEvent(): void {
        // Estações não sofrem eventos
    }

    /**
     * Calcula o aluguel da estação baseado na quantidade possuída
     * @param numberOfStations - Número de estações que o jogador possui
     * @returns Valor do aluguel a ser cobrado
     */
    override getRent(numberOfStations?: number): number | null {
        if (numberOfStations === undefined) {
            return null;
        }
        switch (numberOfStations) {
            case 1:
                return 250;   // Uma estação
            case 2:
                return 500;   // Duas estações
            case 3:
                return 1000;  // Três estações
            case 4:
                return 2000;  // Todas as estações
            default:
                return null;
        }
    }
}