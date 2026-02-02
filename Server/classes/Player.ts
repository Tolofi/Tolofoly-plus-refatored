type PlayerDTO = {
  id: number;
  username: string;
  posicao: number;
  saldo: number;
  propriedades: Record<number, string>;
  estacoes: number;
  companhias: number;
  preso: boolean;
  turnosPrisao: number;
};

/**
 * Classe Player - Representa um jogador no jogo de Monopoly
 * Gerencia posição no tabuleiro, saldo, propriedades, prisão e status geral do jogador
 */
export class Player {
  id: number;
  username: string;
  socketId: string;
  posicao: number = 0; // Posição atual no tabuleiro (0-39)
  saldo: number = 15000; // Saldo inicial do jogador
  propriedades: Map<number, string> = new Map<number, string>(); // Propriedades possuídas
  estacoes: number = 0; // Quantidade de estações que o jogador possui
  companhias: number = 0; // Quantidade de companhias que o jogador possui
  preso: boolean = false; // Indica se o jogador está na cadeia
  turnosPrisao: number = 0; // Número de turnos restantes na cadeia

  /**
   * Construtor do jogador
   * @param id - ID único do jogador
   * @param username - Nome de usuário do jogador
   * @param socketId - ID da conexão WebSocket
   */
  constructor(id: number, username: string, socketId: string) {
    this.id = id;
    this.username = username;
    this.socketId = socketId;
  }

  /**
   * Move o jogador pelo tabuleiro de forma circular
   * Se ultrapassar a casa 39, volta para o início
   * @param quantidade - Número de casas a avançar
   */
  mover(quantidade: number) {
    const TOTAL = 40; // Total de casas no tabuleiro
    this.posicao = (((this.posicao + quantidade) % TOTAL) + TOTAL) % TOTAL;
  }

  /**
   * Define ou remove o estado de prisão do jogador
   * @param a - true para prender, false para libertar
   */
  setPreso(a: boolean) {
    this.preso = a;
    // Reseta o contador de turnos ao ser preso
    if (a) {
        this.turnosPrisao = 0;
    }
  }

  /**
   * Adiciona uma propriedade ao inventário do jogador
   * @param id - ID da propriedade
   * @param propriedade - Objeto da propriedade
   */
  adicionarPropriedade(id: number, propriedade: any) {
    this.propriedades.set(id, propriedade);
  }

  /**
   * Remove uma propriedade do inventário do jogador
   * @param id - ID da propriedade a remover
   */
  removerPropriedade(id: number) {
    this.propriedades.delete(id);
  }

  /**
   * Atualiza o saldo do jogador
   * @param valor - Valor a adicionar (pode ser negativo)
   */
  atualizarSaldo(valor: number) {
    this.saldo += valor;
  }

  /**
   * Verifica se o jogador possui uma propriedade específica
   * @param id - ID da propriedade
   * @returns true se possui, false caso contrário
   */
  verficarPropriedade(id: number): boolean {
    return this.propriedades.has(id);
  }

  /**
   * Deduz um valor do saldo do jogador
   * @param valor - Quantia a descontar
   */
  deduzirSaldo(valor: number) {
    this.saldo -= valor;
  }

  /**
   * Adiciona um valor ao saldo do jogador
   * @param valor - Quantia a adicionar
   */
  aumentarSaldo(valor: number) {
    this.saldo += valor;
  }

  /**
   * Retorna o saldo atual do jogador
   * @returns Saldo em dinheiro do jogo
   */
  getSaldo(): number {
    return this.saldo;
  }

  /**
   * Retorna a posição atual do jogador no tabuleiro
   * @returns Número da casa (0-39)
   */
  getPosicao(): number {
    return this.posicao;
  }

  /**
   * Incrementa o contador de estações que o jogador possui
   */
  increaseEstacoes() {
    this.estacoes += 1;
  }

  /**
   * Incrementa o contador de companhias que o jogador possui
   */
  increaseCompanhias() {
    this.companhias += 1;
  }

  /**
   * Decrementa o contador de estações do jogador
   */
  decreaseEstacoes() {
    this.estacoes -= 1;
  }

  /**
   * Decrementa o contador de companhias do jogador
   */
  decreaseCompanhias() {
    this.companhias -= 1;
  }

  /**
   * Retorna a quantidade de companhias que o jogador possui
   * @returns Número de companhias
   */
  getCompanhias() {
    return this.companhias;
  }

  /**
   * Retorna a quantidade de estações que o jogador possui
   * @returns Número de estações
   */
  getEstacoes() {
    return this.estacoes;
  }

  /**
   * Retorna o nome de usuário do jogador
   * @returns Nome de usuário
   */
  getUsername(): string {
    return this.username;
  }

  /**
   * Retorna uma array com os IDs de todas as propriedades do jogador
   * @returns Array de IDs de propriedades
   */
  getPropriedadesId(): number[] {
    return Array.from(this.propriedades.keys());
  }

  /**
   * Retorna uma array com os nomes de todas as propriedades do jogador
   * @returns Array de nomes de propriedades
   */
  getPropriedadesNomes(): string[] {
    return Array.from(this.propriedades.values());
  }

  /**
   * Retorna se o jogador está atualmente na cadeia
   * @returns true se está preso, false caso contrário
   */
  getPreso(): boolean {
    return this.preso;
  }

  toDTO(): PlayerDTO {
    return {
      id: this.id,
      username: this.username,
      posicao: this.posicao,
      saldo: this.saldo,
      propriedades: Object.fromEntries(this.propriedades),
      estacoes: this.estacoes,
      companhias: this.companhias,
      preso: this.preso,
      turnosPrisao: this.turnosPrisao,
    };
  }
}
