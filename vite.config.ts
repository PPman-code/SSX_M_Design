import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { networkInterfaces } from 'node:os';

function previewAddresses(): Plugin {
  return {
    name: 'local-preview-addresses',
    configureServer(server) {
      server.middlewares.use('/__preview-addresses', (_request, response) => {
        const port = server.config.server.port ?? 5178;
        const host = server.config.server.host;
        const lanEnabled = host === true || host === '0.0.0.0' || host === '::';
        const addresses = Object.entries(networkInterfaces())
          .sort(([a], [b]) => Number(!a.startsWith('en')) - Number(!b.startsWith('en')))
          .filter(([name]) => !name.startsWith('utun'))
          .flatMap(([, entries]) => entries ?? [])
          .filter((entry) => entry.family === 'IPv4' && !entry.internal)
          .map((entry) => entry.address)
          .filter((ip) => /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip));
        response.setHeader('Content-Type', 'application/json');
        response.setHeader('Cache-Control', 'no-store');
        response.end(JSON.stringify({ urls: lanEnabled ? [...new Set(addresses)].map((ip) => `http://${ip}:${port}/`) : [] }));
      });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), previewAddresses()],
  server: { port: 5178, strictPort: true },
  build: { sourcemap: false },
});
