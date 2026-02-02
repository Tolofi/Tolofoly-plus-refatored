/**
 * Classe Propriedade - Representa uma propriedade no tabuleiro do Monopoly
 * Gerencia proprietário, aluguel, construções, eventos e modificadores de preço
 */
export class Propriedade {
  id: number;
  name: string;
  ownerUsername: string | null = null; // Nome de usuário do proprietário
  weather: string = "clean"; // Clima atual da propriedade (clean, rainy, stormy)
  hour: string = "day"; // Período do dia (dia ou noite)
  eventDuration: number = 0; // Duração em turnos de um evento ativo
  acummulatedCapital: number = 0; // Capital acumulado no aluguel
  rentMultiplier: number = 1; // Multiplicador dinâmico do aluguel (influenciado por eventos)
  alertMessage: string = ""; // Mensagem sobre eventos/modificadores ativos
  themeColor: string; // Cor tema da propriedade para UI
  color: string; // Cor/grupo da propriedade (Marrom, Azul, Estação, etc)
  baseRent: number | null; // Aluguel base sem construções
  price: number | null; // Preço de compra da propriedade
  level: number = 0; // Nível de construção (0-5: terreno, casa 1-4, hotel)
  levelUpCost: number | null; // Custo para construir/melhorar
  
  // Arrays de aluguel para cada nível de construção
  rent?: number[] | null;
  originalRent?: number[] | null; // Backup seguro dos valores originais

  /**
   * Construtor da propriedade
   * @param id - ID único da propriedade
   * @param name - Nome descritivo da propriedade
   * @param themeColor - Cor para exibição
   * @param color - Grupo/cor da propriedade
   * @param levelUpCost - Custo para construir
   * @param baseRent - Aluguel base
   * @param price - Preço de compra
   * @param rent - Array de aluguéis por nível (opcional)
   */
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

    // 1. Inicializa o array de aluguel
    if (rent && rent.length > 0) {
      this.rent = rent;
    } else if (baseRent !== null) {
      // Gera automaticamente a progressão de aluguel com base matemática
      // A cada nível, o aluguel aumenta exponencialmente (base 15)
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

    // 2. Cria um backup seguro dos valores originais de aluguel
    // Usamos spread operator [...] para quebrar a referência de memória
    if (this.rent) {
      this.originalRent = [...this.rent]; 
    }
  }

  /**
   * Arredonda um número para o múltiplo de 0.5 mais próximo
   * @param num - Número a arredondar
   * @returns Número arredondado
   */
  roundToHalf(num: number): number {
    return Math.round(num * 2) / 2;
  }

  /**
   * Calcula e retorna o aluguel dinâmico da propriedade
   * O cálculo leva em conta o nível de construção e multiplicadores (clima, eventos)
   * O array 'rent' permanece intacto com os valores originais
   * @returns Valor do aluguel a ser cobrado
   */
  getRent(): number | null | undefined {
    // Obtém o valor base do aluguel de acordo com o nível de construção
    const valorBase = this.getLevel() > 0
      ? this.rent![this.getLevel() - 1]
      : this.baseRent;

    if (valorBase === null || valorBase === undefined) return null;

    // Aplica multiplicadores dinâmicos (clima, eventos, etc)
    return this.roundToHalf(valorBase * this.rentMultiplier);
  }

  // ==================== MÉTODOS GET/SET ====================

  /**
   * Retorna o nome de usuário do proprietário
   * @returns Nome do proprietário ou null se sem dono
   */
  getOwner(): string | null { return this.ownerUsername; }

  /**
   * Define o proprietário da propriedade
   * @param username - Nome do novo proprietário ou null
   */
  setOwner(username: string | null): void { this.ownerUsername = username; }

  /**
   * Retorna o nome da propriedade
   * @returns Nome descritivo
   */
  getName(): string { return this.name; }

  /**
   * Retorna a cor/grupo da propriedade
   * @returns Cor ou tipo de propriedade
   */
  getColor(): string { return this.color; }

  /**
   * Retorna o nível atual de construção
   * @returns Nível (0-5)
   */
  getLevel(): number { return this.level; }

  /**
   * Retorna o preço de compra da propriedade
   * @returns Preço em dinheiro do jogo
   */
  getPrice(): number | null { return this.price; }

  /**
   * Retorna o custo para construir/melhorar a propriedade
   * @returns Custo da próxima construção
   */
  getLevelUpCost(): number | null { return this.levelUpCost; }
  
  /**
   * Aumenta o nível de construção da propriedade
   * @returns Novo nível ou undefined se já no máximo
   */
  increaseLevel(): number | undefined {
    if (this.level > 4) return;
    return this.level++;
  }

  /**
   * Reduz o nível de construção da propriedade
   * @returns Novo nível ou undefined se já no mínimo
   */
  decreaseLevel(): number | undefined {
    if (this.level < 1) return;
    return this.level--;
  }

  /**
   * Retorna o ID único da propriedade
   * @returns ID numérico
   */
  getId(): number { return this.id; }
  
  /**
   * Reseta a propriedade ao estado inicial
   * Remove proprietário e todas as construções
   */
  reset(): void {
    this.level = 0;
    this.ownerUsername = null;
  }

  /**
   * Adiciona capital acumulado (aluguel) à propriedade
   * @param qtd - Quantia a adicionar
   */
  addCapital(qtd: number): void { this.acummulatedCapital += qtd; }

  /**
   * Zera o capital acumulado da propriedade
   */
  resetCapital(): void { this.acummulatedCapital = 0; }
  
  /**
   * Gera aleatoriamente o clima da propriedade
   * Influencia o multiplicador de aluguel (apenas para estações)
   * 15% chance de tempestade (chuva pesada)
   * 15% chance de chuva
   * 70% chance de céu limpo
   */
  randomWeather() {
    const rand = Math.random();
    if (rand < 0.15) { this.weather = "stormy"; } 
    else if (rand < 0.3) { this.weather = "rainy"; } 
    else { this.weather = "clear"; }
  }

  /**
   * Retorna o clima atual da propriedade
   * @returns Tipo de clima (stormy, rainy, clear)
   */
  getWeather(): string { return this.weather; }
  
  /**
   * Define o período do dia para a propriedade
   * @param hour - "dia" ou "noite"
   * @param inverter - Se true, inverte o período
   */
  setHour(hour: string, inverter?: boolean): void {
    if (hour === "dia" || hour === "noite")
      this.hour = inverter ? (hour === "dia" ? "noite" : "dia") : hour;
  }
  
  /**
   * Define o multiplicador dinâmico do aluguel
   * Afeta o cálculo final do aluguel a ser cobrado
   * @param multiplier - Valor do multiplicador (ex: 1.3 = +30%)
   */
  setRentMultiplier(multiplier: number): void {
    this.rentMultiplier = multiplier;
  }

  /**
   * Define a mensagem de alerta/evento da propriedade
   * Exibida ao jogador quando visita a propriedade
   * @param message - Mensagem descritiva
   */
  setAlertMessage(message: string): void {
    this.alertMessage = message;
  }

  /**
   * Define a duração em turnos de um evento ativo
   * @param duration - Número de turnos que o evento dura
   */
  setEventDuration(duration: number): void {
    this.eventDuration = duration;
  }
  
  /**
   * Decrementa a duração do evento ativo
   * Quando chegar a zero, reseta multiplicadores e mensagens
   */
  decreaseEventDuration(): void {
    if (this.eventDuration > 0) {
      this.eventDuration--;
    }
    // Quando evento termina, volta ao normal
    if (this.eventDuration === 0) {
      this.rentMultiplier = 1;
      this.setAlertMessage("");
    }
  }

  /**
   * Gera um evento aleatório para a propriedade
   * Eventos afetam o multiplicador de aluguel por um período
   * Chance de 3% de evento ocorrer a cada turno
   * Exemplos: Obra municipal (-30%), Festa (+30%), Barulho (-10%), etc
   */
  generateRandomEvent(): void {
    const rand = Math.random();
    const rand2 = Math.random();
    
    // 3% de chance de um evento ocorrer
    if (this.eventDuration === 0) {
      if (rand2 < 0.03) { 
        // Sorteia qual evento vai acontecer
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