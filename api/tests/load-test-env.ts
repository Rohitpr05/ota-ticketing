import dotenv from "dotenv";

// Loaded before src/db.ts reads .env, and dotenv never overrides, so tests always use the test database.
dotenv.config({ path: ".env.test", quiet: true });
