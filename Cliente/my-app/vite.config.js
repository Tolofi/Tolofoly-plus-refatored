import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        /* cole o conteúdo do json acima aqui também */
      },
    }),
  ],

  // ADICIONE ESTE BLOCO ABAIXO:
  server: {
    host: true,
  },
});
