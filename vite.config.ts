import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  root: 'client',
  server: {
    port: 3000,
    open: 'index.html',
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        app: 'index.html',
        
      },
    },
  },
});