import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { resolve } from 'path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  // Relative asset URLs: the build is served from wherever it is copied, e.g.
  // demos/demo-core/ inside the docs site.
  base: './',
  build: {
    minify: false,
    cssMinify: false,
  },
  server: {
    host: true, // bind to 0.0.0.0 so devcontainer port forwarding works
    fs: {
      allow: [resolve(__dirname, '../..')],
    },
  },
  resolve: {
    // Workspace TS packages import with .js extensions (required for ESM TS).
    // This remaps .js → .ts so Vite finds the source files.
    extensionAlias: {
      '.js': ['.ts', '.js'],
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: ['node_modules'],
      },
    },
  },
});
