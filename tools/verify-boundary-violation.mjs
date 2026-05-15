import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const boundaryFixtures = [
  {
    file: "apps/web/test-fixtures/boundary-violation.ts",
    expectedRule: "no-restricted-imports",
  },
  {
    file: "apps/web/test-fixtures/leaflet-boundary-violation.ts",
    expectedRule: "no-restricted-imports",
  },
  {
    file: "apps/web/test-fixtures/icon-boundary-violation.ts",
    expectedRule: "no-restricted-imports",
  },
  {
    file: "apps/web/test-fixtures/motion-page-boundary-violation.ts",
    expectedRule: "no-restricted-imports",
  },
  {
    file: "apps/web/test-fixtures/inline-zod-boundary-violation.ts",
    expectedRule: "no-restricted-imports",
  },
  {
    file: "apps/web/test-fixtures/boundaries/app/app-feature-private-import.ts",
    expectedRule: "boundaries/dependencies",
  },
  {
    file: "apps/web/test-fixtures/boundaries/features/bookings/cross-feature-import.ts",
    expectedRule: "boundaries/dependencies",
  },
  {
    file: "apps/web/test-fixtures/boundaries/shared/lib/shared-feature-import.ts",
    expectedRule: "boundaries/dependencies",
  },
];

for (const boundaryFixture of boundaryFixtures) {
  try {
    await execFileAsync(
      "pnpm",
      ["exec", "eslint", "--max-warnings", "0", boundaryFixture.file],
      {
        cwd: process.cwd(),
        env: process.env,
      },
    );

    throw new Error(
      `Boundary violation fixture unexpectedly passed lint: ${boundaryFixture.file}`,
    );
  } catch (error) {
    const commandError =
      /** @type {{ stdout?: string; stderr?: string; code?: number; message?: string }} */ (
        error
      );
    const output = `${commandError.stdout ?? ""}\n${commandError.stderr ?? ""}`;

    if (!output.includes(boundaryFixture.expectedRule)) {
      throw new Error(
        `Boundary verification failed for an unexpected reason in ${boundaryFixture.file}. Output:\n${output || commandError.message || "No output"}`,
      );
    }

    if (commandError.code === 0) {
      throw new Error(
        `Boundary violation fixture returned exit code 0: ${boundaryFixture.file}`,
      );
    }
  }

  process.stdout.write(
    `Boundary violation fixture correctly failed lint: ${boundaryFixture.file}\n`,
  );
}
