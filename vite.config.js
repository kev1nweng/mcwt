import { defineConfig } from 'vite';
import { execSync } from 'child_process';

export default defineConfig(({ mode }) => {
  const commitHash = mode === 'development'
    ? 'dev'
    : execSync('git rev-parse --short HEAD').toString().trim();

  return {
    define: {
      __APP_VERSION__: JSON.stringify(commitHash),
    },
  };
});
