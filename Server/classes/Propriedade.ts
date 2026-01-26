export class Propriedade {
  id: number;
  name: string;
  ownerUsername: string | null = null;
  acummulatedCapital: number = 0;
  themeColor: string;
  color: string;
  baseRent: number | null;
  price: number | null;
  level: number = 0;
  levelUpCost: number | null;
  rent?: number[] | null;

  constructor(
    id: number,
    name: string,
    themeColor: string,
    color: string,
    levelUpCost: number | null,
    baseRent: number | null,
    price: number | null,
    rent?: number[] | null // Interrogação permite que seja opcional
  ) {
    this.id = id;
    this.name = name;
    this.themeColor = themeColor;
    this.color = color;
    this.price = price;
    this.levelUpCost = levelUpCost;
    this.baseRent = baseRent;

    if (rent && rent.length > 0) {
      // Se você passou [200, 400...], ele DEVE entrar aqui
      this.rent = rent;
    } else if (baseRent !== null) {
      this.rent = [
        baseRent,
        Math.round((baseRent * 15 ** (2 / 5)) / 100) * 100,
        Math.round((baseRent * 15 ** (3 / 5)) / 100) * 100,
        Math.round((baseRent * 15 ** (4 / 5)) / 100) * 100,
        Math.round((baseRent * 15 ** (5 / 5)) / 100) * 100,
        Math.round((baseRent * 15 ** (6 / 5)) / 100) * 100,
      ];
    } else {
      // Caso contrário (Sorte/Imposto), fica vazio
      this.rent = [];
    }
  }

  roundToHalf(num: number): number {
    return Math.round(num * 2) / 2;
  }

  getOwner(): string | null {
    return this.ownerUsername;
  }
  setOwner(username: string | null): void {
    this.ownerUsername = username;
  }
  getName(): string {
    return this.name;
  }
  getColor(): string {
    return this.color;
  }
  getRent(): number | null | undefined {
    return this.getLevel() > 0
      ? this.rent![this.getLevel() - 1]
      : this.baseRent;
  }
  getLevel(): number {
    return this.level;
  }
  getPrice(): number | null {
    return this.price;
  }
  getLevelUpCost(): number | null {
    return this.levelUpCost;
  }
  increaseLevel(): number | undefined {
    if(this.level > 4) return
    return this.level++;
  }
  decreaseLevel(): number | undefined {
    if(this.level < 1) return
    return this.level--;
  }
  getId(): number {
    return this.id;
  }
  reset(): void {
    this.level = 0;
    this.ownerUsername = null;
  }
  addCapital(qtd: number): void {
    this.acummulatedCapital += qtd;
  }
  resetCapital(): void {
    this.acummulatedCapital = 0;
  }
}
