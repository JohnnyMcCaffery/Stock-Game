import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function localDatabasePlugin(): Plugin {
  const dataDir = path.resolve(__dirname, 'data');
  const saveFilePath = path.join(dataDir, 'savegame.json');

  return {
    name: 'local-database-plugin',
    configureServer(server) {
      server.middlewares.use('/api/state', (req, res, next) => {
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }

        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          if (fs.existsSync(saveFilePath)) {
            const data = fs.readFileSync(saveFilePath, 'utf-8');
            res.end(data);
          } else {
            res.end(JSON.stringify({ exists: false }));
          }
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              fs.writeFileSync(saveFilePath, body, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, timestamp: new Date().toISOString() }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to write savegame file to disk' }));
            }
          });
          return;
        }

        if (req.method === 'DELETE') {
          if (fs.existsSync(saveFilePath)) {
            fs.unlinkSync(saveFilePath);
          }
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), localDatabasePlugin()],
});
