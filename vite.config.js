import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

const targetUrl = process.env.API_TARGET || 'http://localhost:8080';

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    host: true, 
    port: 80,
    headers: {
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Opener-Policy': 'unsafe-none',
    }, 
    proxy: {
      '/api': {
        target: targetUrl, 
        changeOrigin: true
      },
      '/ws-chat': {
        target: targetUrl, 
        ws: true,
        changeOrigin: true
      }
    }
  }
});