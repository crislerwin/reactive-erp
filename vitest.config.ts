import { defineConfig } from "vitest/config";
import alias from "@rollup/plugin-alias";
import path from "path";

export default defineConfig({
  test: {
    exclude: ["node_modules", ".next", "e2e", ".git"],
    include: ["**/*.test.{ts,tsx}"],
  },
  plugins: [
    alias({
      entries: [{ find: "@", replacement: path.resolve(__dirname, "./src") }],
    }) as Plugin,
  ],
});
