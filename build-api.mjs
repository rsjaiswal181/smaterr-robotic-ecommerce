const { build } = require('esbuild');
const path = require('path');

async function bundleApi() {
  await build({
    entryPoints: [path.join(__dirname, 'backend/src/app.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: path.join(__dirname, 'api/index.js'),
    external: ['@aws-sdk/*'],
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    banner: {
      js: `const require = (await import("module")).createRequire(import.meta.url);`,
    },
    format: 'esm',
    outExtension: { '.js': '.mjs' },
    conditions: ['import', 'node'],
  });
}

bundleApi().catch((err) => {
  console.error(err);
  process.exit(1);
});
