import { defineConfig } from 'vitest/config';

export default defineConfig({
  oxc: { jsx: { runtime: 'automatic' } },
  test: {
    include: ['test/**/*.test.js'],
    coverage: {
      include: ['src/**/*.{js,jsx}'],
      reporter: ['text', 'lcov'],
    },
  },
});
