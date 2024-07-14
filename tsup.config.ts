import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/**/*.ts'],
  splitting: false,
  sourcemap: false,
  clean: true,
  dts: false,
  format: 'esm',
  platform: 'node',
  target: 'node21'
});
