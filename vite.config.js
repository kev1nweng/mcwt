import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { execSync } from "child_process";

export default defineConfig(({ mode }) => {
  const commitHash =
    mode === "development"
      ? "dev"
      : execSync("git rev-parse --short HEAD").toString().trim();

  return {
    plugins: [tailwindcss()],
    define: {
      __APP_VERSION__: JSON.stringify(commitHash),
    },
  };
});
