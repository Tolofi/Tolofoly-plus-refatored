import { Propriedade } from "./Propriedade";

export class PropriedadeSorte extends Propriedade {
    private jogador: string | null = null;
    constructor(id: number, nome: string, color: string = "sorte") {
        super(id, nome, "#484d50 ",color, null, null, null);
    }
    gerarMensagem(jogador: string): string {
        return "";
    }
}