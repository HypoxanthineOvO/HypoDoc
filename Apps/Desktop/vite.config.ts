import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    target: "es2022",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("mermaid")) return "mermaid";
          if (id.includes("shiki") || id.includes("@shikijs")) return "shiki";
          if (id.includes("katex")) return "katex";
        },
      },
    },
  },
  server: {
    port: 4317,
    strictPort: true,
  },
});
