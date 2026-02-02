import { Memory } from "./Memory";
import { Banco } from "./Banco";

/**
 * Classe EfeitoCarta - Implementa os efeitos de cartas de sorte/azar do jogo
 * Processa ações como movimentação, transações financeiras, prisão, etc
 * Cada método corresponde a um efeito possível de uma carta
 */
export class EfeitoCarta {
    /**
     * Altera o saldo do jogador (prêmios ou multas)
     * Transações diretas entre banco e jogador
     * @param username - Nome do jogador
     * @param valor - Valor a adicionar (positivo) ou descontar (negativo)
     * @returns Mensagem descritiva da ação
     */
    static alterarSaldo(username: string, valor: number): string {
        const player = Memory.getPlayerByUsername(username);
        if (!player) return "Jogador não encontrado";

        if (valor > 0) {
            player.aumentarSaldo(valor);
            return `${username} recebeu R$ ${valor} do Banco.`;
        } else {
            player.deduzirSaldo(Math.abs(valor));
            return `${username} pagou R$ ${Math.abs(valor)} ao Banco.`;
        }
    }

    /**
     * Realiza transferência monetária entre dois jogadores
     * Exemplo: Apostas, pagamentos de serviços, presentes
     * @param de - Username do jogador que envia
     * @param para - Username do jogador que recebe
     * @param valor - Valor a transferir
     * @returns Mensagem descritiva do resultado
     */
    static transferenciaEntreJogadores(de: string, para: string, valor: number): string {
        const res = Banco.transacaoMonetaria(valor, de, para);
        return res.status ? `Transferência de R$ ${valor} concluída.` : "Erro na transferência.";
    }

    /**
     * Teleporta o jogador para uma casa específica no tabuleiro
     * Exemplo: "Vá para o Ponto de Partida", "Vá para a Estação"
     * @param username - Nome do jogador
     * @param destinoId - ID da casa para onde ir
     * @param passarPeloInicio - Se deve ganhar R$2000 ao passar pelo início
     */
    static teleportarPara(username: string, destinoId: number, passarPeloInicio: boolean = true): void {
        const player = Memory.getPlayerByUsername(username);
        if (!player) return;

        const posicaoAntiga = player.getPosicao();
        player.posicao = destinoId;

        // Se teleportar para trás no tabuleiro e autorizado, ganha bônus
        if (passarPeloInicio && destinoId < posicaoAntiga) {
            Banco.pontoPartida(username);
        }
    }

    /**
     * Move o jogador um número relativo de casas
     * Exemplo: "Avance 3 casas", "Recue 2 casas"
     * @param username - Nome do jogador
     * @param passos - Número de casas (positivo avança, negativo recua)
     */
    static moverPassos(username: string, passos: number): void {
        const player = Memory.getPlayerByUsername(username);
        if (player) player.mover(passos);
    }

    /**
     * Envia o jogador para a cadeia
     * @param username - Nome do jogador
     * @returns Mensagem descritiva
     */
    static enviarPrisao(username: string): string {
        return Banco.prenderJogador(username);
    }

    /**
     * Cobra uma taxa por cada construção que o jogador possui
     * Exemplo: "Reparos em todos os edifícios - pague R$40 por casa"
     * @param username - Nome do jogador
     * @param valorPorCasa - Valor a descontar por cada nível de construção
     * @returns Total da multa cobrada
     */
    static taxaPorConstrucao(username: string, valorPorCasa: number): number {
        const player = Memory.getPlayerByUsername(username);
        if (!player) return 0;

        let totalMulta = 0;
        // Calcula a multa total sobre todas as construções
        player.getPropriedadesId().forEach(id => {
            const prop = Memory.getPropriedadeById(id);
            if (prop && prop.level > 0) {
                totalMulta += (prop.level * valorPorCasa);
            }
        });

        // Deduz do saldo do jogador
        player.deduzirSaldo(totalMulta);
        return totalMulta;
    }

    /**
     * Troca a posição de dois jogadores no tabuleiro
     * Exemplo: "Troque de lugar com outro jogador"
     * @param userA - Username do primeiro jogador
     * @param userB - Username do segundo jogador
     */
    static trocarLugares(userA: string, userB: string): void {
        const playerA = Memory.getPlayerByUsername(userA);
        const playerB = Memory.getPlayerByUsername(userB);
        if (playerA && playerB) {
            const tempPos = playerA.posicao;
            playerA.posicao = playerB.posicao;
            playerB.posicao = tempPos;
        }
    }

    /**
     * Concede isenção de aluguel para a próxima vez que cair em propriedade de outro
     * Nota: Requer implementação de flag adicional no Player
     * @param username - Nome do jogador que recebe isenção
     */
    static concederIsencao(username: string): void {
        // TODO: Implementar flag 'isentoProximoAluguel' no Player.ts
        console.log(`${username} ganhou isenção de aluguel.`);
    }

    /**
     * Concede ao jogador um turno extra para jogar os dados novamente
     * @param socket - Objeto WebSocket do jogador
     */
    static turnoExtra(socket: any): void {
        socket.emit("yourTurn", { hasRolled: false });
    }

    /**
     * Coleta um valor de todos os outros jogadores e repassa ao destinatário
     * Exemplo: "Aniversário - todos pagam R$50 para você"
     * @param recebedor - Username do jogador que recebe
     * @param valorCada - Valor a receber de cada jogador
     */
    static coletaGeral(recebedor: string, valorCada: number): void {
        const todos = Memory.getAllPlayerUsernameByArray();
        todos.forEach(p => {
            if (p !== recebedor) {
                Banco.transacaoMonetaria(valorCada, p, recebedor);
            }
        });
    }

    /**
     * Penaliza o jogador fazendo-o perder turnos
     * Nota: Requer implementação de contador no Player
     * @param username - Nome do jogador
     * @param turnos - Número de turnos a perder
     */
    static penalizarTurno(username: string, turnos: number): void {
        // TODO: Implementar contador de turnos perdidos no Player.ts
        console.log(`${username} perderá ${turnos} turno(s).`);
    }

    /**
     * Rouba uma propriedade de outro jogador
     * Nota: Efeito raro, pode quebrar o equilíbrio do jogo
     * @param propriedadeId - ID da propriedade a roubar
     * @param novoDono - Username do novo proprietário
     */
    static roubarPropriedade(propriedadeId: number, novoDono: string): void {
        const prop = Memory.getPropriedadeById(propriedadeId);
        if (!prop || !prop.ownerUsername) return;

        const donoAntigo = prop.ownerUsername;
        Banco.transferenciaPropriedade(propriedadeId, donoAntigo, novoDono);
    }
}