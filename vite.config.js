import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    port : 80,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
     },
      // 🌟 이 부분이 꼭 추가되어야 채팅이 백엔드로 넘어갑니다!
      '/ws-chat': {
        target: 'http://localhost:8080',
        ws: true, // 웹소켓 허용
        changeOrigin: true
      }
    }
  }
});
