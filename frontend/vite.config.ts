import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    // 개발용: 브라우저가 /comfy/* 로 같은 출처에 요청 → 로컬 ComfyUI(8000)로 프록시 (CORS 회피).
    // 운영(서비스)에서는 각 사용자의 로컬 ComfyUI에 직접 붙고 --enable-cors-header 필요.
    proxy: {
      '/comfy': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/comfy/, ''),
        // ComfyUI는 Origin≠Host면 POST를 403 거부(CSRF 방지) → Origin/Referer를 ComfyUI 것으로 맞춤
        configure: (proxy: { on: (e: string, cb: (r: { setHeader: (k: string, v: string) => void }) => void) => void }) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('origin', 'http://127.0.0.1:8000')
            proxyReq.setHeader('referer', 'http://127.0.0.1:8000/')
          })
        },
      },
    },
  },
})
