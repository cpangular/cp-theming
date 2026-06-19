import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        // Allow @use '@cpangular/cp-theming-core/scss/...' to resolve from node_modules
        loadPaths: ['node_modules'],
      },
    },
  },
});
