module.export = [
  {
    files: [
      "**/*.ts",
      "**/*.js"
    ],
    ignorePatterns: [
      "/lib/**/*", // Ignore built files.
      "/generated/**/*", // Ignore generated files.
    ],
    extends: [
      "eslint:recommended", 
      "plugin:import/errors", 
      "plugin:import/warnings", 
      "google",
      "plugin:import/typescript",
      "plugin:@typescript-eslint/recommended",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      project: ["tsconfig.json", "tsconfig.dev.json"],
      sourceType: "module",
    },
    plugins: [
      "@typescript-eslint",
      "import",
    ],
    rules: {
      "quotes": ["error", "double"],
      "import/no-unresolved": 0,
      "indent": ["error", 2],
    },
  },
  // ...other config
];