import React from "react";
// 1. Recebemos { conectado } com as chaves
export const ConnectionLabel = ({ conectado }) => {
  return (
    <div className="connection-wrapper">
      {/* Muda a cor da bolinha dinamicamente */}
      <div className={`status-dot ${conectado ? "online" : "offline"}`}></div>

      {/* Muda o texto dependendo do status */}
      <div className="status-label">
        {conectado ? "Conectado" : "Desconectado"}
      </div>
    </div>
  );
};
