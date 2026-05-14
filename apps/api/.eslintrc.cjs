const baseConfig = require("../../packages/config/.eslintrc.base.js");

module.exports = {
  ...baseConfig,
  root: true,
  parserOptions: {
    ...baseConfig.parserOptions,
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
  rules: {
    ...baseConfig.rules,
    "no-console": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: [
              "**/bookings/bookings.service",
              "**/bookings/bookings.service.*",
            ],
            message:
              "Cross-domain service import. Domains compose via module imports or events, never direct service reach-through.",
          },
          {
            group: [
              "**/vehicles/vehicles.service",
              "**/vehicles/vehicles.service.*",
            ],
            message:
              "Cross-domain service import. Domains compose via module imports or events, never direct service reach-through.",
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ["src/**/*.controller.ts"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [
              {
                name: "drizzle-orm",
                message:
                  "Controllers must not query the DB. Delegate to a service.",
              },
            ],
            patterns: [
              {
                group: [
                  "**/database/database.service",
                  "**/database/database.service.*",
                ],
                message:
                  "Controllers must not import DatabaseService. Delegate to a service which delegates to a repository.",
              },
              {
                group: ["**/database/schema/*"],
                message:
                  "Controllers must not import DB schema. Services return domain objects from @rental/validations.",
              },
            ],
          },
        ],
      },
    },
    {
      files: ["src/**/*.service.ts"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: [
                  "**/database/database.service",
                  "**/database/database.service.*",
                ],
                message:
                  "Services must go through a repository — never import DatabaseService directly.",
              },
              {
                group: ["**/database/schema/*"],
                message:
                  "Services must not import DB schema. The repository owns the mapping to domain objects.",
              },
            ],
          },
        ],
      },
    },
    {
      files: [
        "src/**/*.spec.ts",
        "src/**/*.integration.test.ts",
        "test/**/*.ts",
      ],
      rules: {
        "no-console": "off",
        "no-restricted-imports": "off",
      },
    },
  ],
};
