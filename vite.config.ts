import { resolve } from 'node:path';
import fs from 'node:fs';
import type { Connect, Plugin } from 'vite';
import type { ServerResponse } from 'node:http';
import { defineConfig } from 'vite';

/**
 * Dev-only Vite plugin that exposes a POST /api/sprite-commit endpoint.
 * Writes the PNG to public/sprites/{name}/sheet.png and updates sprites.json.
 * This plugin is dev-server only — does not affect the production build.
 */
const spriteCommitPlugin: Plugin = {
  name: 'sprite-commit',
  configureServer(server) {
    server.middlewares.use(
      '/api/sprite-commit',
      (req: Connect.IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: Buffer) => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const payload = JSON.parse(body) as {
              name: string;
              pngBase64: string;
              manifest: {
                sheet: string;
                frameWidth: number;
                frameHeight: number;
                animations: Record<string, { frames: [number, number]; frameRate?: number }>;
              };
            };

            const { name, pngBase64, manifest: entry } = payload;

            if (!name || !pngBase64) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'name and pngBase64 are required' }));
              return;
            }

            // Create directory public/sprites/{name}/
            const spriteDir = resolve(__dirname, 'public', 'sprites', name);
            fs.mkdirSync(spriteDir, { recursive: true });

            // Write PNG from base64
            const pngBuffer = Buffer.from(pngBase64, 'base64');
            const pngPath = resolve(spriteDir, 'sheet.png');
            fs.writeFileSync(pngPath, pngBuffer);

            // Read and update sprites.json
            const spritesJsonPath = resolve(__dirname, 'public', 'sprites', 'sprites.json');
            let existing: Record<string, unknown> = {};
            try {
              existing = JSON.parse(fs.readFileSync(spritesJsonPath, 'utf-8')) as Record<string, unknown>;
            } catch {
              // sprites.json missing or malformed — start fresh
            }

            existing[name] = entry;
            fs.writeFileSync(spritesJsonPath, JSON.stringify(existing, null, 2));

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, path: `sprites/${name}/sheet.png` }));
          } catch (err) {
            console.error('[sprite-commit] Error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(err) }));
          }
        });
      },
    );
  },
};

/**
 * Dev-only Vite plugin for updating sprite manifest entries without re-uploading PNGs.
 */
const spriteManifestUpdatePlugin: Plugin = {
  name: 'sprite-manifest-update',
  configureServer(server) {
    server.middlewares.use(
      '/api/sprite-manifest-update',
      (req: Connect.IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const payload = JSON.parse(body) as {
              name: string;
              entry: {
                sheet: string;
                frameWidth: number;
                frameHeight: number;
                animations: Record<string, { frames: [number, number]; frameRate?: number }>;
              };
            };

            const { name, entry } = payload;
            if (!name || !entry) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'name and entry are required' }));
              return;
            }

            const spritesJsonPath = resolve(__dirname, 'public', 'sprites', 'sprites.json');
            let existing: Record<string, unknown> = {};
            try {
              existing = JSON.parse(fs.readFileSync(spritesJsonPath, 'utf-8')) as Record<string, unknown>;
            } catch { /* start fresh */ }

            existing[name] = entry;
            fs.writeFileSync(spritesJsonPath, JSON.stringify(existing, null, 2));

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true }));
          } catch (err) {
            console.error('[sprite-manifest-update] Error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(err) }));
          }
        });
      },
    );
  },
};

export default defineConfig({
  base: './',
  server: {
    host: true,
  },
  plugins: [spriteCommitPlugin, spriteManifestUpdatePlugin],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        viewer: resolve(__dirname, 'viewer.html'),
      },
      output: {
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },
  },
});
