import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig(() => {
  const buildId = `${process.env.VERCEL_GIT_COMMIT_SHA || 'local'}-${Date.now()}`;
  return {
    define: { __APP_BUILD_ID__: JSON.stringify(buildId) },
    plugins: [tailwindcss(), react(), {
      name: 'mpempa-release', apply: 'build',
      closeBundle() {
        const assets = readdirSync('dist/assets').filter(file => /\.(js|css)$/.test(file)).map(file => `/assets/${file}`);
        writeFileSync('dist/version.json', JSON.stringify({ id: buildId }));
        writeFileSync('dist/sw.js', readFileSync('public/sw.js', 'utf8')
          .replaceAll('__MPEMPA_BUILD_ID__', buildId)
          .replace('/*__PRECACHE__*/[]', JSON.stringify(['/', '/mobile/', ...assets])));
      },
    }],
    build: { rollupOptions: { input: { desktop: resolve('index.html'), mobile: resolve('mobile.html') } } },
    server: { host: '0.0.0.0', port: 3000 },
    preview: { host: '0.0.0.0', port: 3000 },
  };
});
