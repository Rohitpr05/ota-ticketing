import { execSync } from "node:child_process";
import dotenv from "dotenv";

// Bring the test database schema up to date once, before any test file runs.
export default function globalSetup() {
  dotenv.config({ path: ".env.test", quiet: true });
  execSync("npx prisma migrate deploy", { stdio: "ignore" });
}
