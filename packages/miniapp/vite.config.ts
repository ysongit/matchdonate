import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: true,
    proxy: {
      '/api/nonprofits': {
        target: 'https://projects.propublica.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nonprofits/, '/nonprofits/api/v2'),
      },
    },
  },
});
