import js from "@eslint/js";
import tseslint from "typescript-eslint";
import jsdoc from "eslint-plugin-jsdoc";
import globals from "globals";

export default tseslint.config(
  // ── Ignore build output and generated files ──────────────────────────────
  {
    ignores: ["dist/**", "dist-server/**", "node_modules/**", "src/generated/**"],
  },

  // ── TypeScript source files ───────────────────────────────────────────────
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    plugins: { jsdoc },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
    },
    rules: {
      // Require a JSDoc block on every exported declaration.
      // publicOnly means only exported items are checked.
      "jsdoc/require-jsdoc": [
        "error",
        {
          publicOnly: true,
          require: {
            // Function and class declarations are covered by default.
            FunctionDeclaration: true,
            ClassDeclaration: true,
          },
          contexts: [
            // Exported arrow-function const components and utilities.
            "ExportNamedDeclaration > VariableDeclaration",
            // Exported type aliases (e.g. `export type Foo = ...`).
            "ExportNamedDeclaration > TSTypeAliasDeclaration",
            // Exported interfaces (e.g. `export interface Foo { ... }`).
            "ExportNamedDeclaration > TSInterfaceDeclaration",
            // Default-export function declarations (e.g. `export default function App() {}`).
            "ExportDefaultDeclaration > FunctionDeclaration",
          ],
        },
      ],
      // Require a non-empty description in every JSDoc block.
      "jsdoc/require-description": "error",
    },
  },

  // ── Test files — JSDoc not required ──────────────────────────────────────
  {
    files: [
      "src/**/*.test.{ts,tsx}",
      "src/test/**/*.{ts,tsx}",
    ],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
    },
    // No jsdoc plugin; no jsdoc rules.
  },

  // ── Entry points — JSDoc not required ────────────────────────────────────
  {
    files: ["src/entry-client.tsx", "src/entry-server.tsx"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
    },
    // No jsdoc rules for the app entry point.
  },

  // ── Config / script files (Node environment) ──────────────────────────────
  {
    files: ["*.config.{js,ts,mjs}"],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2020,
      },
    },
  },

  // ── Script TypeScript/JS files ─────────────────────────────────────────────
  {
    files: ["scripts/**/*.{ts,js,mjs}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2020,
      },
    },
  },

  // ── Script test files — JSDoc not required ────────────────────────────────
  {
    files: ["scripts/**/*.test.ts"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2020,
      },
    },
  },
);
