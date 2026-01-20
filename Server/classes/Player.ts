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

export class Player {
  id: number;
  username: string;
  socketId: string;
  posicao: number = 0;
  saldo: number = 15000;
  propriedades: Map<number, string> = new Map<number, string>();
  estacoes: number = 0;
  companhias: number = 0;
  preso: boolean = false;
  turnosPrisao: number = 0;

  constructor(id: number, username: string, socketId: string) {
    this.id = id;
    this.username = username;
    this.socketId = socketId;
  }

  mover(quantidade: number) {
    const TOTAL = 40;
    this.posicao = (((this.posicao + quantidade) % TOTAL) + TOTAL) % TOTAL;
  }
  setPreso(a: boolean) {
    this.preso = a;
    if (a) {
        this.turnosPrisao = 0; // Reseta ao ser preso
    }
  }
  adicionarPropriedade(id: number, propriedade: any) {
    this.propriedades.set(id, propriedade);
  }
  removerPropriedade(id: number) {
    this.propriedades.delete(id);
  }
  atualizarSaldo(valor: number) {
    this.saldo += valor;
  }
  verficarPropriedade(id: number): boolean {
    return this.propriedades.has(id);
  }
  deduzirSaldo(valor: number) {
    this.saldo -= valor;
  }
  aumentarSaldo(valor: number) {
    this.saldo += valor;
  }
  getSaldo(): number {
    return this.saldo;
  }
  getPosicao(): number {
    return this.posicao;
  }
  increaseEstacoes() {
    this.estacoes += 1;
  }
  increaseCompanhias() {
    this.companhias += 1;
  }
  decreaseEstacoes() {
    this.estacoes -= 1;
  }
  decreaseCompanhias() {
    this.companhias -= 1;
  }

  getCompanhias() {
    return this.companhias;
  }

  getEstacoes() {
    return this.estacoes;
  }

  getUsername(): string {
    return this.username;
  }

  getPropriedadesId(): number[] {
    return Array.from(this.propriedades.keys());
  }

  getPropriedadesNomes(): string[] {
    return Array.from(this.propriedades.values());
  }

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
