import { Propriedade } from "./Propriedade";

export class PropriedadeCompanhia extends Propriedade {
    constructor(id: number, nome: string, color: string = "Companhia") {
        super(id, nome, "#787878", color, null, null, 1500, [200, 400, 800, 1600]);
    }

    override generateRandomEvent(): void {
        // Companhias não sofrem eventos
    }

    override getRent(numberOfCompanies?: number): number | null {
        if (numberOfCompanies === undefined) {
            return null;
        }
        switch (numberOfCompanies) {
            case 1:
                return 200;
            case 2:
                return 400;
            case 3:
                return 800;
            case 4:
                return 1600;
            default:
                return null;
        }
    }
}