import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['specs/**/*.spec.ts'],
    exclude: ['node_modules', 'dist', 'ios'],
  },
});
