const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const distServer = path.join(process.cwd(), 'dist', 'server.cjs');
const distHtml = path.join(process.cwd(), 'dist', 'index.html');

if (!fs.existsSync(distServer) || !fs.existsSync(distHtml)) {
  console.log('[Start Script] dist/server.cjs or dist/index.html not found. Running build step...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (err) {
    console.warn('[Start Script] npm run build failed, falling back to direct esbuild...', err?.message);
    try {
      execSync('npx esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs', { stdio: 'inherit' });
    } catch (e) {
      console.error('[Start Script] esbuild fallback failed:', e);
      process.exit(1);
    }
  }
}

console.log('[Start Script] Launching server from dist/server.cjs...');
require(distServer);
