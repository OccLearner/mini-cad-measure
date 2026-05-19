import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const getBasePath = () => {
  const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];

  if (!process.env.GITHUB_ACTIONS || !repositoryName || repositoryName.endsWith('.github.io')) {
    return '/';
  }

  return `/${repositoryName}/`;
};

export default defineConfig({
  base: getBasePath(),
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx']
  }
});
