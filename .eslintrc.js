module.exports = {
  root: true,
  plugins: ["@typescript-eslint", "eslint-plugin", "prettier"],
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:eslint-plugin/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  rules: {
    // "no-unused-vars": "warn",
  },
}

// {
//   env: {
//     es2021: true,
//     node: true,
//   },
//   extends: ["@typescript-eslint", "eslint-config-prettier"],
//   overrides: [],
//   plugins: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "eslint-config-prettier"],
//   parser: "@typescript-eslint/parser",
//   parserOptions: {
//     ecmaVersion: "latest",
//     sourceType: "module",
//   },
//   rules: {
//     "prettier/prettier": "warn",
//   },
// }
