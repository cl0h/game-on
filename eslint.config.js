import globals from "globals";
import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";

export default [
  // ESLint's recommended rules
  js.configs.recommended,

  // Disables rules that conflict with Prettier
  prettierConfig,

  // Custom configuration for your project
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.mocha,
      },
    },
  },
];