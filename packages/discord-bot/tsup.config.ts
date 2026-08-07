import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    register: "src/register.ts",
  },
  format: ["esm"],
  target: "node18",
  outDir: "dist",
  clean: true,
  sourcemap: true,
});
