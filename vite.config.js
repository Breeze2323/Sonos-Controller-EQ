import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createControllerHandler } from './server/controller.js'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'bounded-sonos-controller-routes',
      configureServer(server) {
        const handler = createControllerHandler()
        server.middlewares.use((req, res, next) => handler(req, res, next))
      },
    },
  ],
  server: { host: '127.0.0.1', port: Number.parseInt(process.env.PORT || '5173', 10) },
})
