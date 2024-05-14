import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
        client: "./src/entry-client.tsx",
        server: "./src/entry-server.tsx",
      },
    },
  },
});
