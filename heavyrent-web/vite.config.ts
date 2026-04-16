import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 3002 },
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/auth',
      'firebase/storage',
    ],
  },
  build: {
    rollupOptions: {
      // Tell Rollup not to fail on @firebase/* peer dep imports —
      // they are bundled inside the firebase package itself
      external: [],
    },
  },
});
