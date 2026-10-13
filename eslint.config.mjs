import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Minified browser bundles, built from the library repo by
    // `pnpm build:cdn --out <here>`. Generated output that is never edited
    // here, so linting it only reports on esbuild's choices.
    "public/cdn/**",
  ]),
]);

export default eslintConfig;
