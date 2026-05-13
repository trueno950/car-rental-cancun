const baseConfig = require("../../packages/config/.eslintrc.base.js");

const apiBoundaryPattern = {
  group: ["../../api/**", "../api/**", "apps/api/**", "@rental/api", "@rental/api/*"],
  message: "apps/web cannot import from apps/api. Move shared contracts into packages/*.",
};

const leafletBoundaryPattern = {
  group: ["leaflet", "leaflet/*", "react-leaflet", "react-leaflet/*"],
  message: "Leaflet imports are restricted to apps/web/src/features/map/components/** via the SSR-safe wrapper boundary.",
};

const iconBoundaryPattern = {
  group: [
    "react-icons",
    "react-icons/*",
    "@heroicons/react",
    "@heroicons/react/*",
    "@tabler/icons-react",
    "@phosphor-icons/react",
    "phosphor-react",
    "@fortawesome/*",
  ],
  message: "Use lucide-react exclusively for icons in apps/web.",
};

const motionBoundaryPattern = {
  group: ["framer-motion"],
  message: "Framer Motion must stay inside explicit leaf client components, never in app page/layout files.",
};

const inlineZodBoundaryPattern = {
  group: ["zod/*"],
  message: "Use shared Zod contracts from @rental/validations at form and API boundaries; inline schemas are forbidden here.",
};

const inlineZodBoundaryPath = {
  name: "zod",
  message: "Use shared Zod contracts from @rental/validations at form and API boundaries; inline schemas are forbidden here.",
};

const boundariesElements = [
  {
    type: "app",
    pattern: "app/**/*",
    mode: "file",
  },
  {
    type: "app",
    pattern: "test-fixtures/boundaries/app/**/*",
    mode: "file",
  },
  {
    type: "feature",
    pattern: "src/features/*",
    mode: "folder",
    capture: ["featureName"],
  },
  {
    type: "feature",
    pattern: "test-fixtures/boundaries/features/*",
    mode: "folder",
    capture: ["featureName"],
  },
  {
    type: "shared",
    pattern: "src/shared/*",
    mode: "folder",
    capture: ["sharedSegment"],
  },
  {
    type: "shared",
    pattern: "test-fixtures/boundaries/shared/*",
    mode: "folder",
    capture: ["sharedSegment"],
  },
  {
    type: "core",
    pattern: "src/core/*",
    mode: "folder",
    capture: ["coreSegment"],
  },
  {
    type: "core",
    pattern: "test-fixtures/boundaries/core/*",
    mode: "folder",
    capture: ["coreSegment"],
  },
];

module.exports = {
  ...baseConfig,
  root: true,
  ignorePatterns: [...(baseConfig.ignorePatterns ?? [])],
  plugins: [...(baseConfig.plugins ?? []), "boundaries"],
  env: {
    ...baseConfig.env,
    browser: true,
  },
  parserOptions: {
    ...baseConfig.parserOptions,
    ecmaFeatures: {
      jsx: true,
    },
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
  settings: {
    ...(baseConfig.settings ?? {}),
    "boundaries/elements": boundariesElements,
  },
  rules: {
    ...baseConfig.rules,
    "boundaries/dependencies": [
      "error",
      {
        default: "disallow",
        rules: [
          {
            allow: {
              dependency: {
                relationship: {
                  to: "internal",
                },
              },
            },
          },
          {
            from: {
              type: "app",
            },
            allow: {
              to: {
                type: ["app", "feature", "shared", "core"],
              },
            },
          },
          {
            from: {
              type: "app",
            },
            disallow: {
              to: {
                type: "feature",
                internalPath: "!index.ts",
              },
            },
            message: "app/ must import features only through each feature index.ts barrel.",
          },
          {
            from: {
              type: "feature",
            },
            allow: {
              to: {
                type: ["shared", "core"],
              },
            },
          },
          {
            from: {
              type: "shared",
            },
            allow: {
              to: {
                type: ["shared", "core"],
              },
            },
          },
          {
            from: {
              type: "core",
            },
            disallow: {
              to: {
                type: "*",
              },
            },
            message: "core/ must stay isolated from other internal layers.",
          },
        ],
      },
    ],
    "no-restricted-imports": [
      "error",
        {
          patterns: [
            apiBoundaryPattern,
            leafletBoundaryPattern,
            iconBoundaryPattern,
          ],
        },
      ],
  },
  overrides: [
    {
      files: ["src/features/map/components/**/*.ts", "src/features/map/components/**/*.tsx"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              apiBoundaryPattern,
              iconBoundaryPattern,
            ],
          },
        ],
      },
    },
    {
      files: ["app/**/page.tsx", "app/**/layout.tsx", "test-fixtures/motion-page-boundary-violation.ts"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              apiBoundaryPattern,
              leafletBoundaryPattern,
              iconBoundaryPattern,
              motionBoundaryPattern,
            ],
          },
        ],
      },
    },
    {
      files: ["test-fixtures/boundaries/**/*.ts", "test-fixtures/boundaries/**/*.tsx"],
      rules: {
        "@typescript-eslint/no-unused-vars": "off",
      },
    },
    {
      files: [
        "src/features/reservations/components/**/*.ts",
        "src/features/reservations/components/**/*.tsx",
        "src/features/reservations/actions/**/*.ts",
        "src/features/reservations/actions/**/*.tsx",
        "src/features/reservations/services/**/*.ts",
        "src/features/reservations/services/**/*.tsx",
        "test-fixtures/inline-zod-boundary-violation.ts",
      ],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [inlineZodBoundaryPath],
            patterns: [
              apiBoundaryPattern,
              leafletBoundaryPattern,
              iconBoundaryPattern,
              inlineZodBoundaryPattern,
            ],
          },
        ],
      },
    },
  ],
};
