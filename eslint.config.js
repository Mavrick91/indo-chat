import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

// eslint-disable-next-line @typescript-eslint/no-deprecated
export default tseslint.config(
  // Ignored files
  {
    ignores: [
      "dist/**",
      "build/**",
      "node_modules/**",
      ".output/**",
      "src/routeTree.gen.ts",
    ],
  },

  // Base configs
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,

  // TypeScript parser options
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.js"],
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // React plugin
  {
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // React rules
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // No inline styles
      "react/no-inline-styles": "off",
      "react/jsx-no-constructed-context-values": "error",

      // Self-closing components
      "react/self-closing-comp": "error",

      // JSX boolean shorthand
      "react/jsx-boolean-value": ["error", "never"],

      // Destructure props
      "react/destructuring-assignment": ["error", "always"],

      // No array index as key
      "react/no-array-index-key": "error",

      // Exhaustive hook deps (error, not warn)
      "react-hooks/exhaustive-deps": "error",
    },
  },

  // TypeScript rules
  {
    rules: {
      // No any
      "@typescript-eslint/no-explicit-any": "error",

      // No non-null assertions
      "@typescript-eslint/no-non-null-assertion": "error",

      // Prefer type over interface
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],

      // No explicit return types required (rely on inference)
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",

      // Type assertions allowed — relax the strict config
      "@typescript-eslint/consistent-type-assertions": "off",

      // Prefer const
      "prefer-const": "error",

      // No nested ternaries
      "no-nested-ternary": "error",

      // Max 3 function parameters
      "max-params": ["error", 3],

      // Console as warning
      "no-console": "warn",

      // Naming conventions
      "@typescript-eslint/naming-convention": [
        "error",
        // Default: camelCase
        {
          selector: "default",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        // Variables: camelCase or UPPER_CASE (constants) or PascalCase (components)
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
          leadingUnderscore: "allow",
        },
        // Functions: camelCase or PascalCase (components)
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
        },
        // Types, interfaces, enums: PascalCase
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        // Boolean variables: require is/has/should prefix
        {
          selector: "variable",
          types: ["boolean"],
          format: ["PascalCase"],
          prefix: ["is", "has", "should", "can", "did", "will"],
        },
        // Parameters: camelCase
        {
          selector: "parameter",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        // Object properties: relaxed (external APIs, etc.)
        {
          selector: "objectLiteralProperty",
          format: null,
        },
        // Import: allow any (third-party names)
        {
          selector: "import",
          format: null,
        },
      ],

      // Prefer named exports
      "no-restricted-exports": [
        "error",
        { restrictDefaultExports: { direct: true } },
      ],

      // One component per file — enforced via react-refresh
      // (already configured above with only-export-components)

      // Function declaration style, allow arrow functions for assignments (callbacks, etc.)
      "func-style": ["error", "declaration", { allowArrowFunctions: true }],

      // Event handler naming (handle prefix enforced via naming-convention for functions)
    },
  },

  // Route files — TanStack Router conventions
  {
    files: ["src/routes/**/*.{ts,tsx}"],
    rules: {
      // TanStack Router requires default exports in route files
      "no-restricted-exports": "off",
      // Route files export loaders + components together
      "react-refresh/only-export-components": "off",
    },
  },

  // API route files — allow uppercase HTTP method names (GET, POST, etc.)
  {
    files: ["src/routes/api/**/*.ts"],
    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "function",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        {
          selector: "parameter",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "objectLiteralProperty",
          format: null,
        },
        {
          selector: "objectLiteralMethod",
          format: null,
        },
        {
          selector: "import",
          format: null,
        },
      ],
    },
  },

  // Config files — allow default exports (required by Vite, etc.)
  {
    files: ["*.config.{js,ts}", "*.config.*.{js,ts}"],
    rules: {
      "no-restricted-exports": "off",
    },
  },

  // Prettier must be last to override formatting rules
  eslintConfigPrettier,
);
