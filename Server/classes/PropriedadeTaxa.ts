import { Propriedade } from "./Propriedade";

export class PropriedadeTaxa extends Propriedade {
    private taxAmount: number;
    constructor(id: number, nome: string, taxaAmount: number, color: string = "Taxa") {
        super(id, nome, "#808080",color, null, null, null);
        this.taxAmount = taxaAmount;
    }

    override generateRandomEvent(): void {
        // Taxas não sofrem eventos
    }
}