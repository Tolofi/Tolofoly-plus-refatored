import React from "react";
import { NuPropertyCard } from "./PropertyBaseCard"; // Importe o componente novo que criamos
import { motion, AnimatePresence } from "framer-motion";
import { ExoticProperties } from "./ExoticProperties";

export const CurrentProperty = ({ propriedade, msg }) => {
  if (!propriedade) return null;

  // VERIFICAÇÃO INTELIGENTE:
  // Se tem lista de 'rent' (aluguel), é uma propriedade comprável.
  // Se não tem, é um evento (Prisão, Sorte, etc).
  const isStreet = propriedade.rent && propriedade.rent.length > 0;

  // --- CENÁRIO 1: É RUA? USA O DESIGN FINTECH ---
  // if (isStreet) {
  //   return <NuPropertyCard key={propriedade.name} propriedade={propriedade} />;
  // }

  const isPrison = propriedade.color === "Prisao";
  const isGuest = propriedade.color === "Visitante";
  const isPark = propriedade.color === "Estacionamento";
  const isLucky = propriedade.color === "Sorte";
  const isTax = propriedade.color === "Taxa";
  const isStart = propriedade.color === "Comeco";
  const isExotic = isPrison || isGuest || isPark || isLucky || isTax || isStart;

  // --- CENÁRIO 2: É ESPECIAL? USA O DESIGN DE ÍCONES (SVG) ---
  console.log("current property color: " + propriedade.themeColor);
  return (
    <>
      {/* O mode='wait' espera o antigo sair para o novo entrar. 
          Se tirar o mode='wait', eles se cruzam (um sai enquanto o outro entra) */}
      <AnimatePresence mode="wait">
        {isStreet && (
          <NuPropertyCard
            // Repassar a key aqui também é uma boa prática para garantir
            key={propriedade.name}
            propriedade={propriedade}
          />
        )}
        {isExotic && (
          <ExoticProperties key={propriedade.name} propriedade={propriedade} msg={msg}/>
        )}
      </AnimatePresence>
    </>
  );
};
