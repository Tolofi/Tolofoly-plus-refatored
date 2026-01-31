import { socket } from "../socket";
import { useGameStore } from "./store";

export const getAvailableActions = (propriedade, username, isMyTurn) => {
  const actions = [];
  // Hook chamado aqui funciona desde que o componente pai force o re-render (que fizemos acima)
  const saldo = useGameStore((state) => state.meAsObject?.saldo || 0);

  // Segurança básica
  if (!propriedade || !propriedade.name) return [];

  // --- 1. DEFINIÇÃO DE VARIÁVEIS ---
  const dono = propriedade.ownerUsername || propriedade.dono; // Garante pegar de ambos os lugares
  const isDono = dono === username;
  const semDono = !dono;

  const isEstacaoOrCompanhia =
    propriedade.color === "Estacao" || propriedade.color === "Companhia";
  const preco = propriedade.price || 0;
  const isSorte = propriedade.color === "Sorte";
  const isTaxa = propriedade.color === "Taxa";

  const propId = propriedade.id !== undefined ? propriedade.id : null;
  if (propId === null) return []; // Retorna vazio se não tiver ID válido

  // ============================================================
  // GRUPO A: AÇÕES DE TABULEIRO
  // ============================================================
  if (isMyTurn) {
    if (isTaxa) {
      actions.push({
        label: `Pagar a taxa (R$ ${propriedade.taxAmount})`,
        variant: "success",
        onClick: () => socket.emit("bankPayment", propriedade.taxAmount),
      });
    }

    if (isSorte) {
      actions.push({
        label: `✦ Sortear carta ✦`,
        variant: "success",
        onClick: (e) => {
          if (e && e.currentTarget) {
            e.currentTarget.disabled = true;
            e.currentTarget.style.opacity = "0.5";
            e.currentTarget.innerText = "Carta gerada...";
          }
          socket.emit("getMessage");
        },
      });
    }

    if (
      semDono &&
      preco > 0 &&
      !isSorte &&
      !isTaxa &&
      !["Comeco", "Prisao", "Visitante", "Estacionamento"].includes(
        propriedade.color,
      )
    ) {
      actions.push({
        label: `Comprar (R$ ${preco.toLocaleString("pt-BR")})`,
        variant: "success",
        onClick: () => socket.emit("buyProperty", propId),
      });
    }

    if (!isDono && !semDono) {
      const nivel = propriedade.level || 0;
      const valorAluguel =
        propriedade.rent && propriedade.rent[nivel]
          ? propriedade.rent[nivel]
          : 0;
      const multiplier = propriedade.rentMultiplier || 1;
      actions.push({
        label: `Pagar Aluguel -> ${dono} (R$ ${Math.round(valorAluguel * multiplier)})`,
        variant: "success",
        onClick: (e) => {
          if (saldo < valorAluguel) return alert("Saldo insuficiente!");
          if (e && e.currentTarget) {
            e.currentTarget.disabled = true;
            e.currentTarget.style.opacity = "0.5";
            e.currentTarget.innerText = "Pago ✓";
          }
          socket.emit("playerRentPay", dono, valorAluguel * multiplier, propriedade.id);
        },
      });
    }
  }

  // ============================================================
  // GRUPO B: AÇÕES DE GERENCIAMENTO (Minhas Propriedades)
  // ============================================================
  if (isDono) {
    if (!isEstacaoOrCompanhia) {
      const nivelAtual = propriedade.level || 0;
      const custoUpgrade = propriedade.levelUpCost || 0;

      // Construir (Máximo nível 5 - Hotel)
      if (nivelAtual < 5) {
        const proximoNivel = nivelAtual === 4 ? "Hotel" : "Casa";
        const podePagar = saldo >= custoUpgrade;

        actions.push({
          label: `Construir ${proximoNivel} (R$ ${custoUpgrade})`,
          variant: podePagar ? "primary" : "disabled", // Visualmente indica se pode pagar
          disabled: !podePagar,
          onClick: () => {
            if (podePagar) socket.emit("upgradeProperty", propId);
            else alert("Saldo insuficiente para construir.");
          },
        });
      }

      // Demolir
      if (nivelAtual >= 1) {
        const nivelAnterior = nivelAtual === 5 ? "Hotel" : "Casa";

        actions.push({
          label: `Vender ${nivelAtual === 5 ? "Hotel" : "Casa"} (+R$ ${custoUpgrade})`,
          variant: "primary",
          onClick: () => socket.emit("downgradeProperty", propId),
        });
      }
    }

    actions.push({
      label: `Vender para o Banco (R$ ${(propriedade.price * 0.8).toFixed(0)})`,
      variant: "danger",
      onClick: () => {
        if (
          window.confirm(
            `Tem certeza que deseja vender ${propriedade.name} por R$ ${(propriedade.price * 0.8).toFixed(0)}?`,
          )
        ) {
          socket.emit("sellToBank", propId);
        }
      },
    });
  }

  return actions;
};
