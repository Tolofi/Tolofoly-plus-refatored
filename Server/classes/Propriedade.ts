export class Propriedade {
  id: number;
  name: string;
  ownerUsername: string | null = null;
  weather: string = "clean";
  hour: string = "day";
  eventDuration: number = 0;
  acummulatedCapital: number = 0;
  rentMultiplier: number = 1;
  alertMessage: string = "";
  themeColor: string;
  color: string;
  baseRent: number | null;
  price: number | null;
  level: number = 0;
  levelUpCost: number | null;
  
  // Mantemos os arrays
  rent?: number[] | null;
  originalRent?: number[] | null; // Sua cópia de segurança

  constructor(
    id: number,
    name: string,
    themeColor: string,
    color: string,
    levelUpCost: number | null,
    baseRent: number | null,
    price: number | null,
    rent?: number[] | null, 
  ) {
    this.id = id;
    this.name = name;
    this.themeColor = themeColor;
    this.color = color;
    this.price = price;
    this.levelUpCost = levelUpCost;
    this.baseRent = baseRent;

    // 1. Inicializa o Rent
    if (rent && rent.length > 0) {
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
      this.rent = [];
    }

    // 2. CRIA A CÓPIA DE SEGURANÇA (Backup Seguro)
    // Usamos o spread operator [... ] para quebrar a referência de memória
    if (this.rent) {
      this.originalRent = [...this.rent]; 
    }
  }

  roundToHalf(num: number): number {
    return Math.round(num * 2) / 2;
  }

  // --- MÉTODOS GET/SET ---

  // O PULO DO GATO: O cálculo acontece AQUI, na hora de ler.
  // O array 'rent' permanece intacto (com os valores originais).
  getRent(): number | null | undefined {
    // Pega o valor base original
    const valorBase = this.getLevel() > 0
      ? this.rent![this.getLevel() - 1]
      : this.baseRent;

    if (valorBase === null || valorBase === undefined) return null;

    // Aplica o multiplicador dinamicamente
    return this.roundToHalf(valorBase * this.rentMultiplier);
  }

  // --- RESTO DOS MÉTODOS ---
  // (Removi o updateRent pois ele não é mais necessário e causava bugs)

  getOwner(): string | null { return this.ownerUsername; }
  setOwner(username: string | null): void { this.ownerUsername = username; }
  getName(): string { return this.name; }
  getColor(): string { return this.color; }
  getLevel(): number { return this.level; }
  getPrice(): number | null { return this.price; }
  getLevelUpCost(): number | null { return this.levelUpCost; }
  
  increaseLevel(): number | undefined {
    if (this.level > 4) return;
    return this.level++;
  }
  decreaseLevel(): number | undefined {
    if (this.level < 1) return;
    return this.level--;
  }
  getId(): number { return this.id; }
  
  reset(): void {
    this.level = 0;
    this.ownerUsername = null;
  }
  addCapital(qtd: number): void { this.acummulatedCapital += qtd; }
  resetCapital(): void { this.acummulatedCapital = 0; }
  
  randomWeather() {
    const rand = Math.random();
    if (rand < 0.15) { this.weather = "stormy"; } 
    else if (rand < 0.3) { this.weather = "rainy"; } 
    else { this.weather = "clear"; }
  }
  getWeather(): string { return this.weather; }
  
  setHour(hour: string, inverter?: boolean): void {
    if (hour === "dia" || hour === "noite")
      this.hour = inverter ? (hour === "dia" ? "noite" : "dia") : hour;
  }
  
  setRentMultiplier(multiplier: number): void {
    this.rentMultiplier = multiplier;
  }

  setAlertMessage(message: string): void {
    this.alertMessage = message;
  }
  setEventDuration(duration: number): void {
    this.eventDuration = duration;
  }
  
  decreaseEventDuration(): void {
    if (this.eventDuration > 0) {
      this.eventDuration--;
    }
    if (this.eventDuration === 0) {
      this.rentMultiplier = 1;
      this.setAlertMessage("");
    }
  }

  generateRandomEvent(): void {
    const rand = Math.random();
    const rand2 = Math.random();
    // Ajustado para 3% conforme conversamos (rand2 < 0.03) para evitar caos
    if (this.eventDuration === 0) {
      if (rand2 < 0.03) { 
        if (rand < 0.2) {
          this.alertMessage = "Obra da prefeitura interditou o trânsito na frente. \n (-30% no aluguel.)";
          this.setEventDuration(5);
          this.setRentMultiplier(0.7);
        } else if (rand < 0.4) {
          this.alertMessage = "Vizinho com furadeira logo cedo espantou inquilinos. \n (-10% no aluguel.)";
          this.setEventDuration(3);
          this.setRentMultiplier(0.9);
        } else if (rand < 0.55) {
          this.alertMessage = "O bloco passou na porta e o imóvel virou camarote VIP. \n (+30% no aluguel.)";
          this.setEventDuration(3);
          this.setRentMultiplier(1.3);
        } else if (rand < 0.7) {
          this.alertMessage = "Final de campeonato no estádio vizinho atraiu turistas. \n (+25% no aluguel.)";
          this.setEventDuration(2);
          this.setRentMultiplier(1.25);
        } else if (rand < 0.85) {
          this.alertMessage = "O bairro viralizou no TikTok e a procura disparou. \n (+15% no aluguel.)";
          this.setEventDuration(4);
          this.setRentMultiplier(1.15);
        } else {
          this.alertMessage = "Dia de feira na porta: muito barulho e acesso difícil. \n (-20% no aluguel.)";
          this.setEventDuration(2);
          this.setRentMultiplier(0.8);
        }
      }
    }
  }
}