-- Runs once, on the first start of the MySQL container: creates the database used by `npm test`.
CREATE DATABASE IF NOT EXISTS ota_test;
GRANT ALL PRIVILEGES ON ota_test.* TO 'ota'@'%';
