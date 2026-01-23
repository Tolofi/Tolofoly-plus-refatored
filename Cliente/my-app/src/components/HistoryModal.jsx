import { motion } from "framer-motion";

export const HistoryModal = ({ close, actions = [] }) => {
  return (
    <>
      {/* Overlay escuro */}
      <motion.div
        className="magic-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
      />

      {/* Container do Modal */}
      <motion.div
        className="magic-modal-container"
        initial={{ y: "-100vh", x: "-50%", opacity: 0 }}
        animate={{ y: "-50%", x: "-50%", opacity: 1 }}
        exit={{ y: "-100vh", x: "-50%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <h3 className="magic-modal-title">Histórico de Ações</h3>

        {/* Div com o MAP das ações (Área de Rolagem) */}
        <div
          style={{
            width: "100%",
            textAlign: "left",
            maxHeight: "300px",
            overflowY: "auto",
            marginBottom: "20px",
            paddingRight: "5px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            background: "#f9fafb",
            // Dica visual: Adicionar sombra interna ajuda a ver que tem rolagem
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          {actions.length === 0 ? (
            <div
              style={{ padding: "15px", textAlign: "center", color: "#9ca3af" }}
            >
              Nenhuma ação registrada ainda.
            </div>
          ) : (
            // 🔥 AQUI ESTÁ A MUDANÇA:
            // [...actions] cria uma cópia para não alterar o original
            // .reverse() inverte a ordem (o último vira o primeiro)
            [...actions].reverse().map((acao, index) => (
              <div
                key={index} // Nota: O ideal seria um ID único, mas index serve se a lista não mudar muito
                style={{
                  padding: "10px 12px",
                  borderBottom: "1px solid #e5e7eb",
                  fontSize: "14px",
                  color: "#374151",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor:
                    index % 2 === 0 ? "transparent" : "rgba(0,0,0,0.02)",
                }}
              >
                {/* Dica: Um indicador visual para o item mais recente (o primeiro da lista) */}
                {index === 0 && (
                  <span
                    style={{
                      fontSize: "10px",
                      background: "#10b981",
                      color: "white",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    NOVO
                  </span>
                )}
                {acao}
              </div>
            ))
          )}
        </div>

        {/* Botão para Sair */}
        <button className="magic-modal-btn" onClick={close}>
          Fechar
        </button>
      </motion.div>
    </>
  );
};
