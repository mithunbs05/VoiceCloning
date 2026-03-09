import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080, // Your frontend will run on localhost:8080
    fs: {
      allow: [".", "./client"], // Removed "./shared"
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**"], // Removed "server/**"
    },
  },
  build: {
    outDir: "dist/spa",
  },
  // Removed the custom expressPlugin() since we use Python now
  plugins: [react()], 
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      // Removed the @shared alias
    },
  },
}));