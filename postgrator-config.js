require('dotenv').config();

module.exports = {
  "migrationDirectory": "migrations",
  "driver": "pg",
  "connectionString": (process.env.Node_ENV === 'test') ? process.env.Test_DATABASE_URL : process.env.DATABASE_URL,
  "host": process.env.MIGRATION_DB_HOST,
  "port": process.env.MIGRATION_DB_PORT,
  "database": process.env.NODE_ENV === 'development' ? process.env.TEST_MIGRATION_DB_NAME : process.env.MIGRATION_DB_NAME,
  "username": process.env.MIGRATION_DB_USER,
  "password": process.env.MIGRATION_DB_PASS
};
