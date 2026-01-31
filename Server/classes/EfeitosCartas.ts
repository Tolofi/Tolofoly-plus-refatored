import { Memory } from "./Memory";
import { Banco } from "./Banco";

export class EfeitoCarta {
    /**
     * 1. Transações simples entre Banco e Jogador (Heranças, Prêmios, Multas)
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
     * 2. Transações entre jogadores (Apostas, Serviços, Presentes)
     */
    static transferenciaEntreJogadores(de: string, para: string, valor: number): string {
        const res = Banco.transacaoMonetaria(valor, de, para);
        return res.status ? `Transferência de R$ ${valor} concluída.` : "Erro na transferência.";
    }

    /**
     * 3. Teleporte para casa específica (Vá para o Início, Vá para o Aeroporto)
     */
    static teleportarPara(username: string, destinoId: number, passarPeloInicio: boolean = true): void {
        const player = Memory.getPlayerByUsername(username);
        if (!player) return;

        const posicaoAntiga = player.getPosicao();
        player.posicao = destinoId;

        // Se a nova posição for menor que a antiga (e não for teleporte forçado), ganha bônus
        if (passarPeloInicio && destinoId < posicaoAntiga) {
            Banco.pontoPartida(username);
        }
    }

    /**
     * 4. Movimentação relativa (Avance 3 casas, Recue 2 casas)
     */
    static moverPassos(username: string, passos: number): void {
        const player = Memory.getPlayerByUsername(username);
        if (player) player.mover(passos);
    }

    /**
     * 5. Prisão (Vá para a cadeia)
     */
    static enviarPrisao(username: string): string {
        return Banco.prenderJogador(username);
    }

    /**
     * 6. Taxa por Patrimônio (Reparos em todos os prédios)
     * Baseado nas cartas de "Cupins" ou "Tempestade"
     */
    static taxaPorConstrucao(username: string, valorPorCasa: number): number {
        const player = Memory.getPlayerByUsername(username);
        if (!player) return 0;

        let totalMulta = 0;
        player.getPropriedadesId().forEach(id => {
            const prop = Memory.getPropriedadeById(id);
            if (prop && prop.level > 0) {
                totalMulta += (prop.level * valorPorCasa);
            }
        });

        player.deduzirSaldo(totalMulta);
        return totalMulta;
    }

    /**
     * 7. Troca de Posição (Troque de lugar com o coadjuvante)
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
     * 8. Isenção de Aluguel (Próxima vez que cair em alguém, não paga)
     * Nota: Exige flag no Player.ts para ser consumida no SocketAdmin.
     */
    static concederIsencao(username: string): void {
        // Lógica para setar flag 'isentoProximoAluguel = true' no objeto Player
        console.log(`${username} ganhou isenção de aluguel.`);
    }

    /**
     * 9. Jogar Novamente (Bônus de movimento)
     */
    static turnoExtra(socket: any): void {
        socket.emit("yourTurn", { hasRolled: false });
    }

    /**
     * 10. Coleta Geral (Aniversário: todos pagam ao jogador)
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
     * 11. Penalidade de Turno (Perca a vez)
     */
    static penalizarTurno(username: string, turnos: number): void {
        // Implementar contador de turnos perdidos no Player.ts
        console.log(`${username} perderá ${turnos} turno(s).`);
    }

    /**
     * 12. Roubar Propriedade/Aluguel
     */
    static roubarPropriedade(propriedadeId: number, novoDono: string): void {
        const prop = Memory.getPropriedadeById(propriedadeId);
        if (!prop || !prop.ownerUsername) return;

        const donoAntigo = prop.ownerUsername;
        Banco.transferenciaPropriedade(propriedadeId, donoAntigo, novoDono);
    }
}