import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true, // ADICIONE ISSO AQUI
      },
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "maskable-icon.png",
      ],
      manifest: {
        name: "Tolofoly Plus",
        short_name: "Tolofoly",
        description: "Jogo de Dados Tolofoly",
        theme_color: "#000000",
        background_color: "#ffffff",
        display: "standalone", // AQUI está o segredo para sumir a barra
        start_url: "/",
        icons: [
          {
            src: "logo192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable", // Necessário para Android
          },
          {
            src: "logo512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      // Configuração necessária para o Service Worker funcionar em modo dev ou build
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
    }),
  ],
  server: {
    host: true, // Permite acesso pelo IP da rede local
    port: 5173,
  },
});
