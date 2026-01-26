import { Memory } from "./Memory";
import { GoogleAIService } from "./Mensagem";

export class Banco {
  static transacaoMonetaria(valor: number, de: string, para: string): {status: boolean, msgDe: string | [string, number], msgPara?: string | null} {
    if (valor <= 0) {
      return {status: false, msgDe:"Valor inválido" };
    }

    const playerDe = Memory.getPlayerByUsername(de);
    if (!playerDe) {
      return {status: false, msgDe:"Jogador de origem não encontrado"};
    }

    const playerPara = Memory.getPlayerByUsername(para);
    if (!playerPara) {
      return {status: false, msgDe:"Jogador de destino não encontrado"};
    }

    if (playerDe.saldo < valor) {
      return {status: false, msgDe:"Saldo insuficiente"};
    }

    // tudo validado → executa
    playerDe.deduzirSaldo(valor);
    playerPara.aumentarSaldo(valor);

    return {status: true, msgDe:[para, valor], msgPara: `Você recebeu R$ ${valor} de ${de}`};
  }

  static comprarPropriedade(
    propriedadeId: number,
    comprador: string
  ): { mensagem: string; status: boolean } {
    const player = Memory.getPlayerByUsername(comprador);
    if (!player) {
      return { mensagem: "Jogador não encontrado", status: false };
    }

    const propriedade = Memory.getPropriedadeById(propriedadeId);
    if (!propriedade) {
      return { mensagem: "Propriedade não encontrada", status: false };
    }

    if (propriedade.getOwner()) {
      return { mensagem: "Propriedade já possui dono", status: false };
    }

    if (player.verficarPropriedade(propriedadeId)) {
      return { mensagem: "Jogador já possui essa propriedade", status: false };
    }

    const price = propriedade.getPrice();
    if (price == null) {
      return { mensagem: "Propriedade não pode ser comprada", status: false };
    }

    if (player.saldo < price) {
      return { mensagem: "Saldo insuficiente", status: false };
    }

    // --- EXECUÇÃO DA COMPRA ---

    // 1. Deduz o saldo e registra o novo dono
    player.deduzirSaldo(price);
    propriedade.setOwner(comprador);
    player.adicionarPropriedade(propriedadeId, propriedade);

    // 2. Lógica Especial para ESTAÇÕES
    // Estações aumentam o aluguel (nível) de todas as outras conforme a quantidade
    if (propriedade.getColor() === "Estacao") {
      player.increaseEstacoes();
      const qtdEstacoes = player.getEstacoes();

      // Atualiza o nível de TODAS as estações do jogador para o valor correto (ex: 2 estacoes = lvl 1)
      player.getPropriedadesId().forEach((p) => {
        const objeto = Memory.getPropriedadeById(p);
        if (objeto!.getColor() === "Estacao") {
          objeto!.level = qtdEstacoes - 1;
        }
      });

      console.log(`Estações atualizadas para o nível: ${qtdEstacoes - 1}`);
    }

    // 3. Lógica Especial para COMPANHIAS
    if (propriedade.getColor() === "Companhia") {
      player.increaseCompanhias();
      const qtdComps = player.getCompanhias();

      // Atualiza o nível de TODAS as companhias do jogador
      player.getPropriedadesId().forEach((p) => {
        const objeto = Memory.getPropriedadeById(p);
        if (objeto!.getColor() === "Companhia") {
          objeto!.level = qtdComps - 1;
        }
      });

      console.log(`Companhias atualizadas para o nível: ${qtdComps - 1}`);
    }

    return { mensagem: "Compra realizada com sucesso", status: true };
  }

  static aumentarLevelPropriedade(
    propriedadeId: number,
    jogador: string,
    valorPlayer?: number
  ): string {
    const player = Memory.getPlayerByUsername(jogador);
    const propriedade = Memory.getPropriedadeById(propriedadeId);
    const valor = propriedade?.getLevelUpCost() || 0;
    if (!propriedade) {
      return "Propriedade não encontrada";
    }
    if (!player) {
      return "Jogador não encontrado";
    }
    if (player.getSaldo() < valor) {
      return "Saldo insuficiente";
    }
    if (propriedade.getOwner() !== jogador) {
      return "Jogador não é o dono da propriedade";
    }
    if (propriedade.getLevel() >= 5) {
      return "Propriedade já está com o numero máximo de casas";
    }
    // tudo validado → executa
    player.deduzirSaldo(valor);
    propriedade.level++;
    return "Casa adicionada à propriedade com sucesso";
  }

  static diminuirLevelPropriedade(
    propriedadeId: number,
    jogador: string
  ): string {
    const player = Memory.getPlayerByUsername(jogador);
    const propriedade = Memory.getPropriedadeById(propriedadeId);
    const valor = propriedade?.getLevelUpCost() || 0;
    if (!propriedade) {
      return "Propriedade não encontrada";
    }
    if (!player) {
      return "Jogador não encontrado";
    }
    if (propriedade.getOwner() !== jogador) {
      return "Jogador não é o dono da propriedade";
    }
    if (propriedade.getLevel() <= 0) {
      return "Propriedade já está sem casas";
    }
    // tudo validado → executa
    player.aumentarSaldo(valor);
    propriedade.level -= 1;
    return "Level da propriedade reduzido com sucesso";
  }

  static transferenciaPropriedade(
    propriedadeId: number,
    de: string,
    para: string
  ): string | true {
    const playerDe = Memory.getPlayerByUsername(de);
    const playerPara = Memory.getPlayerByUsername(para);
    const propriedade = Memory.getPropriedadeById(propriedadeId);

    if (!playerDe) {
      return "Jogador de origem não existe";
    }

    if (!playerPara) {
      return "Jogador de destino não existe";
    }

    if (!propriedade) {
      return "Propriedade não encontrada";
    }

    if (!playerDe.verficarPropriedade(propriedadeId)) {
      return "Jogador não possui essa propriedade";
    }

    // passou por tudo → executa
    playerDe.removerPropriedade(propriedadeId);
    playerPara.adicionarPropriedade(propriedadeId, propriedade);
    propriedade.setOwner(para);
    propriedade.resetCapital();
    if (propriedade.getColor() === "Estacao") {
      playerDe.decreaseEstacoes();
      playerPara.increaseEstacoes();
      if (playerPara.getEstacoes() >= 1)
        propriedade.level = playerPara.getEstacoes() - 1;
    }
    if (propriedade.getColor() === "Companhia") {
      playerDe.decreaseCompanhias();
      playerPara.increaseCompanhias();
      if (playerPara.getCompanhias() >= 1)
        propriedade.level = playerPara.getCompanhias() - 1;
    }

    if (propriedade.level > 0) {
      playerDe.aumentarSaldo(propriedade.level * propriedade.getLevelUpCost());
      propriedade.level = 0;
    }

    return "Transferência realizada com sucesso";
  }

  static venderParaBanco(
    propriedadeId: number,
    vendedor: string
  ): { status: boolean; mensagem: string } {
    const player = Memory.getPlayerByUsername(vendedor);
    if (!player) {
      return { status: false, mensagem: "Jogador não encontrado" };
    }

    const propriedade = Memory.getPropriedadeById(propriedadeId);
    if (!propriedade) {
      return { status: false, mensagem: "Propriedade não encontrada" };
    }

    if (!player.verficarPropriedade(propriedadeId)) {
      return { status: false, mensagem: "Jogador não possui essa propriedade" };
    }

    const price = propriedade.getPrice();
    if (price == null) {
      return { status: false, mensagem: "Propriedade não pode ser vendida" };
    }

    // --- INÍCIO DA EXECUÇÃO DA VENDA ---

    // 1. O Banco paga 80% do valor da propriedade (terreno) ao jogador
    player.aumentarSaldo(price * 0.8);

    // 2. Se houver casas ou hotéis (level > 0), o banco reembolsa o custo integral das construções
    // Importante: No Monopoly, construções devem ser vendidas antes do terreno,
    // mas aqui estamos simplificando para vender tudo de uma vez.
    if (propriedade.level > 0) {
      player.aumentarSaldo(propriedade.level * propriedade.getLevelUpCost());
      propriedade.level = 0;
    }

    // 3. Removemos a propriedade do jogador e limpamos o dono
    player.removerPropriedade(propriedadeId);
    propriedade.reset();
    propriedade.resetCapital();

    // 4. LÓGICA ESPECIAL PARA ESTAÇÕES (Recálculo de quem sobrou)
    if (propriedade.getColor() === "Estacao") {
      player.decreaseEstacoes(); // Diminui o contador do jogador
      const novaQtd = player.getEstacoes();

      // Atualiza o nível de todas as estações que RESTARAM no inventário
      player.getPropriedadesId().forEach((p) => {
        const objeto = Memory.getPropriedadeById(p);
        if (objeto && objeto.getColor() === "Estacao") {
          objeto.level = novaQtd > 0 ? novaQtd - 1 : 0;
        }
      });
      console.log(`Estação vendida. Novo nível das restantes: ${novaQtd - 1}`);
    }

    // 5. LÓGICA ESPECIAL PARA COMPANHIAS (Recálculo de quem sobrou)
    if (propriedade.getColor() === "Companhia") {
      player.decreaseCompanhias(); // Diminui o contador do jogador
      const novaQtd = player.getCompanhias();

      player.getPropriedadesId().forEach((p) => {
        const objeto = Memory.getPropriedadeById(p);
        if (objeto && objeto.getColor() === "Companhia") {
          objeto.level = novaQtd > 0 ? novaQtd - 1 : 0;
        }
      });
      console.log(
        `Companhia vendida. Novo nível das restantes: ${novaQtd - 1}`
      );
    }

    return { status: true, mensagem: "Venda realizada com sucesso" };
  }

  static pagamentoAoBanco(
    valor: number,
    jogador: string
  ): { status: boolean; message: string; valor: number } {
    const player = Memory.getPlayerByUsername(jogador);
    if (!player) {
      return { status: false, message: "Jogador não encontrado", valor: 0 };
    }
    if (player.saldo < valor) {
      return { status: false, message: "Saldo insuficiente", valor: 0 };
    }
    // tudo validado → executa
    player.deduzirSaldo(valor);
    return {
      status: true,
      message: "Pagamento realizado com sucesso",
      valor: valor,
    };
  }

  static rolarDados(): number {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    return d1 + d2;
  }
  static prenderJogador(jogador: string): string {
    const player = Memory.getPlayerByUsername(jogador);
    if (!player) {
      return "Jogador não encontrado";
    }
    if (player.preso) {
      return "Jogador já está preso";
    }
    player.preso = true;
    player.turnosPrisao = 3;
    return "Jogador preso com sucesso";
  }
  static tentarSoltarJogador(jogador: string): {
    solto: boolean;
    mensagem: string;
  } {
    const player = Memory.getPlayerByUsername(jogador);
    const sorte = Math.floor(Math.random() * 3) + 1;
    if (!player) {
      return { solto: true, mensagem: "Jogador não encontrado" };
    }
    if (!player.preso) {
      return { solto: true, mensagem: "Jogador não está preso" };
    }
    if (sorte === 3) {
      player.preso = false;
      player.turnosPrisao = 0;
      return { solto: true, mensagem: "Jogador foi solto da prisão" };
    } else {
      player.turnosPrisao--;
      if (player.turnosPrisao <= 0) {
        player.preso = false;
        return { solto: true, mensagem: "Jogador foi solto da prisão" };
      }
    }
    return { solto: false, mensagem: "Jogador continua preso" };
  }

  static soltarJogadorForcado(jogador: string): {
    solto: boolean;
    mensagem: string;
  } {
    const player = Memory.getPlayerByUsername(jogador);
    if (!player) {
      return { solto: true, mensagem: "Jogador não encontrado" };
    }
    if (!player.preso) {
      return { solto: true, mensagem: "Jogador não está preso" };
    }
    player.preso = false;
    player.turnosPrisao = 0;
    return { solto: true, mensagem: "Jogador foi solto da prisão" };
  }
  static moverJogador(jogador: string | null, numero: number) {
    if (!jogador) {
      return "Jogador não encontrado";
    }
    const player = Memory.getPlayerByUsername(jogador);
    player!.mover(numero);
  }
  static pontoPartida(jogador: string): { status: boolean; message: string } {
    const player = Memory.getPlayerByUsername(jogador);
    if (!player) {
      return { status: false, message: "Jogador não encontrado" };
    }
    player.aumentarSaldo(2000);
    return {
      status: true,
      message: `${player.getUsername()} recebeu 2000 ao passar pelo ponnto de partida`,
    };
  }
  static async gerarMensagem(
    jogador: string,
    sorteAzar: boolean,
    jogador2?: string
  ): Promise<string> {
    // Mude de string | undefined para Promise<string>
    const player = Memory.getPlayerByUsername(jogador);
    const player2 = jogador2 ? Memory.getPlayerByUsername(jogador2) : null;

    if (!player) {
      return "Jogador não encontrado";
    }

    // ADICIONE O 'return await' AQUI
    return await GoogleAIService.generateContent({
      contents: `Atue como um gerador de dados JSON para cartas de Monopoly. Sua resposta deve conter UNICAMENTE o objeto JSON, sem blocos de código (markdown), sem explicações e sem texto antes ou depois das chaves.

[REGRAS DE CONTEÚDO]

Tipo: ${sorteAzar ? "SORTE (Benéfico)" : "AZAR (Prejudicial)"}

Jogador: ${player.username}

Contexto: História aleatória, engraçada, mas pé no chão.

Tamanho: O campo "corpo" deve ter entre 40 e 60 palavras.

[ESTRUTURA DO OBJETO] { "titulo": "TÍTULO EM CAIXA ALTA", "corpo": "História de contexto aqui...", "efeito": "Instrução direta de movimentação ou dinheiro" }

Responda apenas o objeto JSON começando com { e terminando com }.`,
    });
  }
}
