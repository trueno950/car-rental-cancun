const baseConfig = require("../../packages/config/.eslintrc.base.js");

module.exports = {
  ...baseConfig,
  root: true,
  parserOptions: {
    ...baseConfig.parserOptions,
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
};
