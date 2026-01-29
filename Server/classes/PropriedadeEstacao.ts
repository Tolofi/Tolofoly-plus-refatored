import { Propriedade } from "./Propriedade";

export class PropriedadeEstacao extends Propriedade {
    constructor(id: number, nome: string, color: string = "Estacao") {
        super(id, nome, "#787878", color, null, null, 2000, [250 , 500, 1000, 2000]);
    }

    override generateRandomEvent(): void {
        // Estações não sofrem eventos
    }

    override getRent(numberOfStations?: number): number | null {
        if (numberOfStations === undefined) {
            return null;
        }
        switch (numberOfStations) {
            case 1:
                return 250;
            case 2:
                return 500;
            case 3:
                return 1000;
            case 4:
                return 2000;
            default:
                return null;
        }
    }
}