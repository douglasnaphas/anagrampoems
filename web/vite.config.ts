import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        client: path.resolve(__dirname, 'src/entry-client'),
        server: path.resolve(__dirname, 'src/entry-server'),
      },
    },
  },
});
