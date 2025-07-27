import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  base: '/jazz-chord-trainer/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png"],
      manifest: {
        name: "Jazz Chord Trainer",
        short_name: "Jazz Chords",
        start_url: "/",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#7f53ac",
        icons: [
          {
            src: "favicon.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      injectRegister: "auto",
    }),
  ],
});
