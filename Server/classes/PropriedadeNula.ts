import { Propriedade } from "./Propriedade";
export class PropriedadeNula extends Propriedade {
  constructor(id: number, nome: string, color: string, themeColor: string) {
    super(id, nome, themeColor, color , null, null, null);
  }
}
