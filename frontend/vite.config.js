// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // optional, default is 5173
    proxy: {
      // forward any /v1 requests to your backend at :4000
    //   "/v1": {
    //     target: "http://localhost:4000",
    //     changeOrigin: true,
    //     secure: false
    //   },
      // forward /api if you use it for oauth etc
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      }
    }
  }
});
