import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget = env.VITE_BACKEND_URL || 'http://localhost:5000'

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              const time = new Date().toLocaleTimeString();
              console.log(
                `\x1b[90m[${time}]\x1b[0m \x1b[36m[API REQ]\x1b[0m \x1b[1m${req.method}\x1b[0m ${req.url}`
              );
            });
            proxy.on('proxyRes', (proxyRes, req) => {
              const time = new Date().toLocaleTimeString();
              const status = proxyRes.statusCode;
              const statusColor =
                status >= 500
                  ? '\x1b[31m' // Red
                  : status >= 400
                  ? '\x1b[33m' // Yellow
                  : '\x1b[32m'; // Green
              console.log(
                `\x1b[90m[${time}]\x1b[0m \x1b[35m[API RES]\x1b[0m \x1b[1m${req.method}\x1b[0m ${req.url} -> ${statusColor}\x1b[1m${status}\x1b[0m`
              );
            });
            proxy.on('error', (err, req) => {
              const time = new Date().toLocaleTimeString();
              console.log(
                `\x1b[90m[${time}]\x1b[0m \x1b[31m[API ERR]\x1b[0m \x1b[1m${req.method}\x1b[0m ${req.url} -> \x1b[31m${err.message}\x1b[0m`
              );
            });
          },
        },
      },
    },
  }
})


