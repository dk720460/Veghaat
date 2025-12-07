import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative base path to ensure assets load correctly on any hosting (Netlify, GitHub Pages)
  base: './', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // Ensure small assets are inlined to reduce requests
    assetsInlineLimit: 4096,
  },
  server: {
    port: 3000,
    open: true
  }
});