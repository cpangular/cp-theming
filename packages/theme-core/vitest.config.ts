import { defineConfig } from 'vitest/config';

// TypeScript API tests. Node's type stripping cannot import src/ (the ThemeMode
// enum, `.js` specifiers), so these run under vitest with jsdom.
export default defineConfig({
  test: {
    include: ['test/api/**/*.spec.ts'],
    environment: 'jsdom',
  },
});
