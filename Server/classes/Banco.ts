import { Memory } from "./Memory";
import { GoogleAIService } from "./Mensagem";

/**
 * Classe Banco - Gerencia todas as transações monetárias do jogo
 * Responsável por transações entre jogadores, compra/venda de propriedades,
 * pagamentos ao banco e gerenciamento de saldos.
 */
export class Banco {
  /**
   * Realiza transferência de dinheiro entre dois jogadores
   * @param valor - Quantia a ser transferida
   * @param de - Username do jogador que está enviando
   * @param para - Username do jogador que está recebendo
   * @returns Objeto com status da transação e mensagens para cada jogador
   */
  static transacaoMonetaria(valor: number, de: string, para: string): {status: boolean, msgDe: string | [string, number], msgPara?: string | null} {
    // Valida se o valor é positivo
    if (valor <= 0) {
      return {status: false, msgDe:"Valor inválido" };
    }

    // Busca o jogador que está enviando
    const playerDe = Memory.getPlayerByUsername(de);
    if (!playerDe) {
      return {status: false, msgDe:"Jogador de origem não encontrado"};
    }

    // Busca o jogador que está recebendo
    const playerPara = Memory.getPlayerByUsername(para);
    if (!playerPara) {
      return {status: false, msgDe:"Jogador de destino não encontrado"};
    }

    // Verifica se o jogador que envia tem saldo suficiente
    if (playerDe.saldo < valor) {
      return {status: false, msgDe:"Saldo insuficiente"};
    }

    // Executa a transferência após validações
    playerDe.deduzirSaldo(valor);
    playerPara.aumentarSaldo(valor);

    return {status: true, msgDe:[para, valor], msgPara: `Você recebeu R$ ${valor} de ${de}`};
  }

  /**
   * Processa a compra de uma propriedade por um jogador
   * Atualiza os níveis de estações e companhias quando aplicável
   * @param propriedadeId - ID da propriedade a ser comprada
   * @param comprador - Username do jogador comprador
   * @returns Objeto com mensagem e status da compra
   */
  static comprarPropriedade(
    propriedadeId: number,
    comprador: string
  ): { mensagem: string; status: boolean } {
    // Busca o jogador comprador
    const player = Memory.getPlayerByUsername(comprador);
    if (!player) {
      return { mensagem: "Jogador não encontrado", status: false };
    }

    // Busca a propriedade a ser comprada
    const propriedade = Memory.getPropriedadeById(propriedadeId);
    if (!propriedade) {
      return { mensagem: "Propriedade não encontrada", status: false };
    }

    // Verifica se a propriedade já possui dono
    if (propriedade.getOwner()) {
      return { mensagem: "Propriedade já possui dono", status: false };
    }

    // Verifica se o jogador já possui esta propriedade
    if (player.verficarPropriedade(propriedadeId)) {
      return { mensagem: "Jogador já possui essa propriedade", status: false };
    }

    // Obtém o preço da propriedade
    const price = propriedade.getPrice();
    if (price == null) {
      return { mensagem: "Propriedade não pode ser comprada", status: false };
    }

    // Verifica se o jogador tem saldo suficiente
    if (player.saldo < price) {
      return { mensagem: "Saldo insuficiente", status: false };
    }

    // ==================== EXECUTA A COMPRA ====================

    // 1. Deduz o saldo do jogador e registra o novo dono da propriedade
    player.deduzirSaldo(price);
    propriedade.setOwner(comprador);
    player.adicionarPropriedade(propriedadeId, propriedade);

    // 2. Lógica especial para ESTAÇÕES
    // Quando um jogador compra uma estação, o aluguel de todas as suas estações aumenta
    // O multiplicador é baseado na quantidade de estações que possui
    if (propriedade.getColor() === "Estacao") {
      player.increaseEstacoes();
      const qtdEstacoes = player.getEstacoes();

      // Atualiza o nível de TODAS as estações do jogador
      // O nível determina quanto de aluguel será cobrado (de acordo com a quantidade possuída)
      player.getPropriedadesId().forEach((p) => {
        const objeto = Memory.getPropriedadeById(p);
        if (objeto!.getColor() === "Estacao") {
          objeto!.level = qtdEstacoes - 1;
        }
      });

      console.log(`Estações atualizadas para o nível: ${qtdEstacoes - 1}`);
    }

    // 3. Lógica especial para COMPANHIAS
    // Funciona similar às estações: o aluguel varia conforme a quantidade possuída
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

  /**
   * Aumenta o nível (casas) de uma propriedade
   * Deduz o custo de construção da propriedade do saldo do jogador
   * @param propriedadeId - ID da propriedade a sofrer upgrade
   * @param jogador - Username do proprietário
   * @param valorPlayer - Valor opcional (não utilizado atualmente)
   * @returns Mensagem descritiva do resultado
   */
  static aumentarLevelPropriedade(
    propriedadeId: number,
    jogador: string,
    valorPlayer?: number
  ): string {
    const player = Memory.getPlayerByUsername(jogador);
    const propriedade = Memory.getPropriedadeById(propriedadeId);
    const valor = propriedade?.getLevelUpCost() || 0;
    
    // Valida se a propriedade existe
    if (!propriedade) {
      return "Propriedade não encontrada";
    }
    
    // Valida se o jogador existe
    if (!player) {
      return "Jogador não encontrado";
    }
    
    // Valida se o jogador tem saldo suficiente
    if (player.getSaldo() < valor) {
      return "Saldo insuficiente";
    }
    
    // Valida se o jogador é o dono da propriedade
    if (propriedade.getOwner() !== jogador) {
      return "Jogador não é o dono da propriedade";
    }
    
    // Valida se a propriedade não atingiu o nível máximo
    if (propriedade.getLevel() >= 5) {
      return "Propriedade já está com o numero máximo de casas";
    }
    
    // Executa o upgrade após validações
    player.deduzirSaldo(valor);
    propriedade.level++;
    return "Casa adicionada à propriedade com sucesso";
  }

  /**
   * Reduz o nível (casas) de uma propriedade
   * Reembolsa ao jogador o custo de construção deduzido
   * @param propriedadeId - ID da propriedade
   * @param jogador - Username do proprietário
   * @returns Mensagem descritiva do resultado
   */
  static diminuirLevelPropriedade(
    propriedadeId: number,
    jogador: string
  ): string {
    const player = Memory.getPlayerByUsername(jogador);
    const propriedade = Memory.getPropriedadeById(propriedadeId);
    const valor = propriedade?.getLevelUpCost() || 0;
    
    // Valida se a propriedade existe
    if (!propriedade) {
      return "Propriedade não encontrada";
    }
    
    // Valida se o jogador existe
    if (!player) {
      return "Jogador não encontrado";
    }
    
    // Valida se o jogador é o dono da propriedade
    if (propriedade.getOwner() !== jogador) {
      return "Jogador não é o dono da propriedade";
    }
    
    // Valida se há casas para remover
    if (propriedade.getLevel() <= 0) {
      return "Propriedade já está sem casas";
    }
    
    // Executa a remoção e reembolsa o jogador
    player.aumentarSaldo(valor);
    propriedade.level -= 1;
    return "Level da propriedade reduzido com sucesso";
  }

  /**
   * Transfere a propriedade de um jogador para outro
   * Recalcula os níveis de estações e companhias para ambos os jogadores
   * @param propriedadeId - ID da propriedade a transferir
   * @param de - Username do proprietário atual
   * @param para - Username do novo proprietário
   * @returns Mensagem descritiva ou true se sucesso
   */
  static transferenciaPropriedade(
    propriedadeId: number,
    de: string,
    para: string
  ): string | true {
    const playerDe = Memory.getPlayerByUsername(de);
    const playerPara = Memory.getPlayerByUsername(para);
    const propriedade = Memory.getPropriedadeById(propriedadeId);

    // Valida se o jogador de origem existe
    if (!playerDe) {
      return "Jogador de origem não existe";
    }

    // Valida se o jogador de destino existe
    if (!playerPara) {
      return "Jogador de destino não existe";
    }

    // Valida se a propriedade existe
    if (!propriedade) {
      return "Propriedade não encontrada";
    }

    // Valida se o jogador de origem realmente possui a propriedade
    if (!playerDe.verficarPropriedade(propriedadeId)) {
      return "Jogador não possui essa propriedade";
    }

    // ==================== EXECUTA A TRANSFERÊNCIA ====================

    // 1. Remove de um jogador e adiciona para outro
    playerDe.removerPropriedade(propriedadeId);
    playerPara.adicionarPropriedade(propriedadeId, propriedade);
    propriedade.setOwner(para);
    propriedade.resetCapital();
    
    // 2. Atualiza contadores e níveis de ESTAÇÕES
    if (propriedade.getColor() === "Estacao") {
      playerDe.decreaseEstacoes();
      playerPara.increaseEstacoes();
      // Define o nível para o novo proprietário baseado em quantas estações tem
      if (playerPara.getEstacoes() >= 1)
        propriedade.level = playerPara.getEstacoes() - 1;
    }
    
    // 3. Atualiza contadores e níveis de COMPANHIAS
    if (propriedade.getColor() === "Companhia") {
      playerDe.decreaseCompanhias();
      playerPara.increaseCompanhias();
      // Define o nível para o novo proprietário baseado em quantas companhias tem
      if (playerPara.getCompanhias() >= 1)
        propriedade.level = playerPara.getCompanhias() - 1;
    }

    // 4. Reembolsa o novo proprietário pelas construções (casas/hotéis) da propriedade
    if (propriedade.level > 0) {
      playerDe.aumentarSaldo(propriedade.level * propriedade.getLevelUpCost());
      propriedade.level = 0;
    }

    return "Transferência realizada com sucesso";
  }

  /**
   * Vende uma propriedade do jogador para o banco
   * O banco paga 80% do valor original e reembolsa 100% das construções
   * A propriedade volta ao estado inicial e fica disponível para compra
   * @param propriedadeId - ID da propriedade a vender
   * @param vendedor - Username do proprietário
   * @returns Objeto com status e mensagem da operação
   */
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

    // Valida se o jogador realmente possui a propriedade
    if (!player.verficarPropriedade(propriedadeId)) {
      return { status: false, mensagem: "Jogador não possui essa propriedade" };
    }

    const price = propriedade.getPrice();
    if (price == null) {
      return { status: false, mensagem: "Propriedade não pode ser vendida" };
    }

    // ==================== EXECUTA A VENDA ====================

    // 1. O banco paga 80% do valor original da propriedade (sem as construções)
    player.aumentarSaldo(price * 0.8);

    // 2. Se houver construções (casas/hotéis), o banco reembolsa integralmente
    // Nota: No Monopoly tradicional, construções devem ser vendidas separadamente,
    // mas aqui simplificamos para vender tudo de uma vez
    if (propriedade.level > 0) {
      player.aumentarSaldo(propriedade.level * propriedade.getLevelUpCost());
      propriedade.level = 0;
    }

    // 3. Remove a propriedade do jogador e reseta seus dados
    player.removerPropriedade(propriedadeId);
    propriedade.reset();
    propriedade.resetCapital();

    // 4. Atualiza os níveis das ESTAÇÕES restantes do jogador
    if (propriedade.getColor() === "Estacao") {
      player.decreaseEstacoes();
      const novaQtd = player.getEstacoes();

      // Recalcula o nível de todas as estações que sobraram no inventário
      player.getPropriedadesId().forEach((p) => {
        const objeto = Memory.getPropriedadeById(p);
        if (objeto && objeto.getColor() === "Estacao") {
          objeto.level = novaQtd > 0 ? novaQtd - 1 : 0;
        }
      });
      console.log(`Estação vendida. Novo nível das restantes: ${novaQtd - 1}`);
    }

    // 5. Atualiza os níveis das COMPANHIAS restantes do jogador
    if (propriedade.getColor() === "Companhia") {
      player.decreaseCompanhias();
      const novaQtd = player.getCompanhias();

      // Recalcula o nível de todas as companhias que sobraram no inventário
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

  /**
   * Realiza pagamento de multas/impostos ao banco
   * Deduz o valor do saldo do jogador
   * @param valor - Quantia a pagar
   * @param jogador - Username do jogador que está pagando
   * @returns Objeto com status, mensagem e valor pago
   */
  static pagamentoAoBanco(
    valor: number,
    jogador: string
  ): { status: boolean; message: string; valor: number } {
    const player = Memory.getPlayerByUsername(jogador);
    if (!player) {
      return { status: false, message: "Jogador não encontrado", valor: 0 };
    }
    
    // Valida se o jogador tem saldo suficiente
    if (player.saldo < valor) {
      return { status: false, message: "Saldo insuficiente", valor: 0 };
    }
    
    // Executa o pagamento
    player.deduzirSaldo(valor);
    return {
      status: true,
      message: "Pagamento realizado com sucesso",
      valor: valor,
    };
  }

  /**
   * Simula o lançamento de dois dados
   * @returns Soma dos dois dados (entre 2 e 12)
   */
  static rolarDados(): number {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    return d1 + d2;
  }

  /**
   * Prende um jogador na cadeia
   * O jogador fica preso por 3 turnos e não pode se mover
   * @param jogador - Username do jogador a ser preso
   * @returns Mensagem descritiva da ação
   */
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

  /**
   * Tenta soltar um jogador da cadeia
   * Tem 33% de chance de sucesso a cada turno
   * Se completar 3 turnos, sai automaticamente
   * @param jogador - Username do jogador
   * @returns Objeto indicando se foi solto e mensagem descritiva
   */
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
    
    // 33% de chance de conseguir sair (quando sorte === 3)
    if (sorte === 3) {
      player.preso = false;
      player.turnosPrisao = 0;
      return { solto: true, mensagem: "Jogador foi solto da prisão" };
    } else {
      // Decrementa o número de turnos na prisão
      player.turnosPrisao--;
      // Se passou 3 turnos, sai automaticamente
      if (player.turnosPrisao <= 0) {
        player.preso = false;
        return { solto: true, mensagem: "Jogador foi solto da prisão" };
      }
    }
    return { solto: false, mensagem: "Jogador continua preso" };
  }

  /**
   * Solta um jogador da cadeia imediatamente (sem teste de sorte)
   * Usado quando o jogador paga fiança ou por decisão administrativa
   * @param jogador - Username do jogador
   * @returns Objeto indicando o resultado da operação
   */
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

  /**
   * Move um jogador pelo tabuleiro
   * O movimento é circular: após a casa 40, volta para a casa 0
   * @param jogador - Username do jogador a mover
   * @param numero - Quantidade de casas a avançar
   */
  static moverJogador(jogador: string | null, numero: number) {
    if (!jogador) {
      return "Jogador não encontrado";
    }
    const player = Memory.getPlayerByUsername(jogador);
    player!.mover(numero);
  }

  /**
   * Premia o jogador por passar pelo ponto de partida
   * O jogador recebe R$ 2000 ao completar uma volta no tabuleiro
   * @param jogador - Username do jogador
   * @returns Objeto com status e mensagem da operação
   */
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

  /**
   * Gera uma mensagem aleatória usando IA
   * Cria narrativas dinâmicas para cartas de sorte/azar do jogo
   * @param jogador - Username do jogador afetado
   * @param sorteAzar - true para sorte, false para azar
   * @param jogador2 - Username do segundo jogador envolvido (opcional)
   * @returns Mensagem gerada pela IA
   */
  static async gerarMensagem(
    jogador: string,
    sorteAzar: boolean,
    jogador2?: string
  ): Promise<string> {
    const player = Memory.getPlayerByUsername(jogador);
    const player2 = jogador2 ? Memory.getPlayerByUsername(jogador2) : null;

    if (!player) {
      return "Jogador não encontrado";
    }

    // Gera a mensagem através do serviço de IA
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
