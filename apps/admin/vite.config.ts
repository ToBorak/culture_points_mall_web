import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import unocss from 'unocss/vite';
import { cpmUnoConfig } from '@cpm/ui/uno';

export default defineConfig({
  plugins: [react(), unocss(cpmUnoConfig)],
  server: {
    host: true,
    allowedHosts: ['cxd.local'],
    port: 5174,
    proxy: {
      '/api': { target: 'http://localhost:18080', changeOrigin: true },
      '/admin': { target: 'http://localhost:18080', changeOrigin: true },
      '/auth': { target: 'http://localhost:18080', changeOrigin: true },
    },
  },
});
