import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendTarget = env.VITE_PROXY_TARGET || env.BACKEND_URL || 'http://localhost:5000';

  return {
    plugins: [react()],
    server: {
      host: true, // Listen on all local IPv4 and IPv6 addresses (127.0.0.1, localhost, LAN)
      port: 5173,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        }
      }
    },
    preview: {
      host: true,
      port: 4173,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
})
