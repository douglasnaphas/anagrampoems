import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        client: path.resolve(__dirname, 'src/entry-client.js'),
        server: path.resolve(__dirname, 'src/entry-server.js')
      }
    }
  }
  // build: {
  //   rollupOptions: {
  //     input: {
  //       main: path.resolve(__dirname, "index.html"),
  //       client: path.resolve(__dirname, "src/entry-client"),
  //       server: path.resolve(__dirname, "src/entry-server"),
  //     },
  //   },
  // },
});
