import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

/**
 * Dev-only "live sync" endpoint. This app has no real backend (no Firebase
 * configured — see services/localStore.js), so without this, a QR scanned
 * on a phone is frozen at whatever snapshot it was generated with: admin
 * edits made afterward never reach an already-open scan page.
 *
 * This plugin turns the Vite dev server itself into a tiny shared store —
 * one small JSON file on disk — reachable over the same LAN URL every
 * device already uses to load the app. The admin's browser POSTs its data
 * here on every change; ProjectMobileScan.jsx polls it from any device
 * (including a phone with no local data at all) to get real updates without
 * re-scanning. Dev-server only — does not exist in a production build.
 */
function liveSyncPlugin() {
  const dataFile = path.resolve(projectRoot, '.wardwatch-live-sync.json')

  return {
    name: 'wardwatch-live-sync',
    configureServer(server) {
      server.middlewares.use('/__wardwatch_sync', (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*')

        if (req.method === 'GET') {
          fs.readFile(dataFile, 'utf8', (err, content) => {
            res.setHeader('Content-Type', 'application/json')
            res.end(err ? 'null' : content)
          })
          return
        }

        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => { body += chunk })
          req.on('end', () => {
            fs.writeFile(dataFile, body, () => {
              res.statusCode = 204
              res.end()
            })
          })
          return
        }

        res.statusCode = 405
        res.end()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), liveSyncPlugin()],
  server: {
    host: true,
    port: 5174,
    strictPort: false,
  },
})
