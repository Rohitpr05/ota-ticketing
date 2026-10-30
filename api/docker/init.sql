-- Runs once on the first start of the MySQL container.
-- Test database, used by `npm test` through .env.test.
CREATE DATABASE IF NOT EXISTS ota_test;
-- Local dev only: Prisma Migrate needs to create a temporary shadow database.
GRANT ALL PRIVILEGES ON *.* TO 'ota'@'%';
