import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Makes it so you can import from "utils/..." instead of "../../utils/..."
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
