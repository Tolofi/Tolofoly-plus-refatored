import { socket } from "../socket";

export const getAvailableActions = (propriedade, username, isMyTurn) => {
  const actions = [];

  // Segurança básica
  if (!propriedade || !propriedade.name) return [];

  // --- 1. DEFINIÇÃO DE VARIÁVEIS ---
  // CORREÇÃO: Tenta pegar o dono de ambas as formas possíveis (owner ou ownerUsername)
  const dono = propriedade.ownerUsername || propriedade.owner;

  const isDono = dono === username;
  // Se 'dono' for nulo, undefined ou string vazia, consideramos sem dono
  const semDono = !dono;

  const isEstacaoOrCompanhia =
    propriedade.color === "Estacao" || propriedade.color === "Companhia";
  const preco = propriedade.price || 0;
  const isSorte = propriedade.color === "Sorte";
  const isTaxa = propriedade.color === "Taxa";

  // Verifica se o ID existe (pode ser 0, então checamos undefined)
  const propId = propriedade.id !== undefined ? propriedade.id : null;

  // ============================================================
  // GRUPO A: AÇÕES DE TABULEIRO (Exigem que seja SUA VEZ)
  // ============================================================
  if (isMyTurn) {
    if (isTaxa) {
      actions.push({
        label: `Pagar a taxa (R$ ${propriedade.taxAmount})`,
        variant: "success",
        onClick: () => {
          if (propId === null) return alert("Erro: ID inválido");
          socket.emit("bankPayment", propriedade.taxAmount);
        },
      });
    }

    if (isSorte) {
      actions.push({
        label: `Tentar a sorte`,
        variant: "success",
        onClick: () => {
          socket.emit("getMessage");
        },
      });
    }

    // COMPRAR (Só se ninguém for dono e não for casa especial)
    if (
      semDono &&
      preco > 0 &&
      !isSorte &&
      !isTaxa &&
      !["Comeco", "Prisao", "Visitante", "Estacionamento"].includes(
        propriedade.color
      )
    ) {
      actions.push({
        label: `Comprar (R$ ${preco.toLocaleString("pt-BR")})`,
        variant: "success",
        onClick: () => {
          if (propId === null) return alert("Erro: ID inválido");
          socket.emit("buyProperty", propId);
        },
      });
    }

    // PAGAR ALUGUEL (Se tem dono e não sou eu)
    if (!isDono && !semDono) {
      const nivel = propriedade.level || 0;
      // Garante que rent é um array antes de acessar
      const valorAluguel =
        propriedade.rent && propriedade.rent[nivel]
          ? propriedade.rent[nivel]
          : 0;

      actions.push({
        label: `Pagar Aluguel -> ${dono} (R$ ${valorAluguel})`,
        variant: "success",
        onClick: () => {
          if (propId === null) return alert("Erro: ID inválido");
          socket.emit("playerTransaction", dono, valorAluguel);
        },
      });
    }
  }

  // ============================================================
  // GRUPO B: AÇÕES DE GERENCIAMENTO (Apenas se for DONO)
  // ============================================================
  // Estas ações aparecem INDEPENDENTE do turno (ex: no Modal),
  // mas exigem estritamente ser o DONO.

  if (isDono) {
    // 1. CONSTRUIR / DESTRUIR (Exceto Estação/Companhia)
    if (!isEstacaoOrCompanhia) {
      const nivelAtual = propriedade.level || 0;
      const custoUpgrade = propriedade.levelUpCost || 0;

      // Construir (Máximo nível 5 - Hotel)
      if (nivelAtual < 5) {
        const proximoNivel = nivelAtual === 4 ? "Hotel" : "Casa";
        actions.push({
          label: `Construir ${proximoNivel} (R$ ${custoUpgrade})`,
          variant: "primary",
          onClick: () => {
            if (propId === null) return;
            console.log(`🏠 Upgrade ID: ${propId}`);
            socket.emit("upgradeProperty", propId);
          },
        });
      }

      // Demolir
      if (nivelAtual >= 1) {
        const nivelAnterior = nivelAtual === 5 ? "Hotel" : "Casa";
        actions.push({
          label: `Destruir ${nivelAnterior} (+R$ ${custoUpgrade})`,
          variant: "primary",
          onClick: () => {
            if (propId === null) return;
            console.log(`(-) Downgrade ID: ${propId}`);
            socket.emit("downgradeProperty", propId);
          },
        });
      }
    }

    // actions.push({
    //   label: `Vender para outro jogador`,
    //   variant: "danger",
    //   onClick: () => {
    //     if (propId === null) return;
    //     if (window.confirm("Vender esta propriedade para o banco?")) {
    //       socket.emit("sellToBank", propId);
    //     }
    //   },
    // });

    // 2. VENDER (Para qualquer propriedade)
    actions.push({
      label: `Vender`,
      variant: "danger",
      onClick: () => {
        if (propId === null) return;
        socket.emit("sellToBank", propId);
      },
    });
  }

  return actions;
};
