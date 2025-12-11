import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  // El plugin `tsconfigPaths` leerá automáticamente los paths de tu `tsconfig.json`.
  plugins: [react(), tsconfigPaths()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // Separa las librerías de node_modules en chunks de "vendor".
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('react')) return 'vendor-react';
            return 'vendor'; // Agrupa el resto en un chunk genérico.
          }
        },
      },
    },
  },
});
