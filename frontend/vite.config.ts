import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/trip': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Increase warning threshold to a more realistic value
    chunkSizeWarningLimit: 600,
    // Disable source maps in production for smaller output
    sourcemap: false,
    rollupOptions: {
      output: {
        // Manual chunk splitting groups heavy vendor libraries into
        // dedicated async chunks so they can be cached independently
        manualChunks: (id) => {
          // React core — loaded on every page, keep separate for long-term caching
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router-dom/') ||
              id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }
          // Leaflet maps — only loaded on map pages
          if (id.includes('node_modules/leaflet') ||
              id.includes('node_modules/react-leaflet')) {
            return 'vendor-maps';
          }
          // Material UI — only loaded in dashboard / tracker pages
          if (id.includes('node_modules/@mui') ||
              id.includes('node_modules/@emotion')) {
            return 'vendor-mui';
          }
          // Recharts — only loaded on analytics pages
          if (id.includes('node_modules/recharts') ||
              id.includes('node_modules/d3-') ||
              id.includes('node_modules/victory-')) {
            return 'vendor-charts';
          }
          // Socket.io — only loaded on live tracking pages
          if (id.includes('node_modules/socket.io-client') ||
              id.includes('node_modules/engine.io-client')) {
            return 'vendor-socket';
          }
          // Everything else in node_modules gets its own vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
        },
      },
    },
  },
})
