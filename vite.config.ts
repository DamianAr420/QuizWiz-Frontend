import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import VueDevTools from "vite-plugin-vue-devtools";

export default defineConfig({
  plugins: [vue(), tailwindcss(), VueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/hubs": {
        target: "http://localhost:7225",
        ws: true,
        changeOrigin: true,
      },
      "/api": {
        target: "http://localhost:7225",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
