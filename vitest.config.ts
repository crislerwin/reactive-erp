import { defineConfig } from "vitest/config";
import alias from "@rollup/plugin-alias";
import path from "path";

export default defineConfig({
  plugins: [
    alias({
      entries: [{ find: "@", replacement: path.resolve(__dirname, "./src") }],
    }),
  ],
});
