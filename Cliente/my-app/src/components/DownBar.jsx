import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export const DownBar = ({
  onTransferClick,
  onHistoryClick,
  onPropertiesClick,
}) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ease: "easeOut", duration: 0.4 }}
    >
      <div className="down-bar">
        <span
          className="down-bar-buttom"
          onClick={onTransferClick}
          style={{ cursor: "pointer" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M8 2v20M13 5H5.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H3" />

            <path d="M16 12h6m-3-3l3 3-3 3" />
          </svg>
        </span>

        <span
          className="down-bar-buttom"
          onClick={onHistoryClick}
          style={{ cursor: "pointer" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M12 7v5l4 2" />
          </svg>
        </span>

        {/* --- ADICIONE O ONCLICK AQUI --- */}
        <span
          className="down-bar-buttom"
          onClick={() => navigate("/propriedades")} // <--- AQUI
          style={{ cursor: "pointer" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </span>
      </div>
    </motion.div>
  );
};
