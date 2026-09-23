require("dotenv").config();
const fs = require("fs");

const configuredSsl = process.env.DB_SSL_CA
  ? {
      ca: fs.readFileSync(process.env.DB_SSL_CA),
      rejectUnauthorized: true
    }
  : undefined;

// Aiven requires TLS. Keep strict verification if its CA has been supplied;
// otherwise allow Aiven's managed certificate for the production connection.
const productionSsl = configuredSsl || { rejectUnauthorized: false };

module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: configuredSsl
    },
    migrations: {
      directory: "./migrations"
    }
  },
  production: {
    client: "mysql2",
    connection: process.env.DATABASE_URL
      ? {
          connectionString: process.env.DATABASE_URL,
          ssl: productionSsl
        }
      : {
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT || 3306),
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          ssl: productionSsl
        },
    migrations: {
      directory: "./migrations"
    }
  }
};
