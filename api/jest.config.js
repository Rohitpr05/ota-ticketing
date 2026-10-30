/** @type {import("jest").Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  globalSetup: "<rootDir>/tests/global-setup.ts",
  setupFiles: ["<rootDir>/tests/load-test-env.ts"],
  // The generated Prisma client imports "./x.js"; point Jest at the .ts source.
  moduleNameMapper: { "^(\\.{1,2}/.*)\\.js$": "$1" },
};
