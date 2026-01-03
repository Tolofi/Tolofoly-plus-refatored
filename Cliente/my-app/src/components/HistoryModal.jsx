import { motion } from "framer-motion";

export const HistoryModal = ({
  close,
  actions = [], // Array de ações (strings do histórico)
}) => {
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
            maxHeight: "300px", // Limita a altura para não estourar a tela
            overflowY: "auto", // Adiciona barra de rolagem se necessário
            marginBottom: "20px",
            paddingRight: "5px", // Espaço para a scrollbar não colar no texto
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            background: "#f9fafb",
          }}
        >
          {actions.length === 0 ? (
            <div
              style={{ padding: "15px", textAlign: "center", color: "#9ca3af" }}
            >
              Nenhuma ação registrada ainda.
            </div>
          ) : (
            actions.map((acao, index) => (
              <div
                key={index}
                style={{
                  padding: "10px 12px",
                  borderBottom: "1px solid #e5e7eb",
                  fontSize: "14px",
                  color: "#374151",
                  fontWeight: "600",
                  // Destaque visual zebrado (opcional)
                  backgroundColor:
                    index % 2 === 0 ? "transparent" : "rgba(0,0,0,0.02)",
                }}
              >
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
