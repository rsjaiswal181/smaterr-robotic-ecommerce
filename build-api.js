const { buildSync } = require('esbuild');

buildSync({
  entryPoints: ['backend/dist/app.js'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: 'api/index.js',
  logLevel: 'info',
  define: {
    'process.env.VERCEL': '"1"',
  },
});
