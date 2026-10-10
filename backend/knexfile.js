require("dotenv").config();
const fs = require("fs");

const caPath = process.env.DB_SSL_CA;
const configuredSsl = caPath && fs.existsSync(caPath)
  ? {
      ca: fs.readFileSync(caPath),
      rejectUnauthorized: true
    }
  : undefined;

if (caPath && !configuredSsl) {
  console.warn(`DB_SSL_CA file not found at "${caPath}"; using managed-certificate TLS for the remote database.`);
}

const remoteDatabase = Boolean(process.env.DATABASE_URL) ||
  Boolean(process.env.DB_HOST && !["localhost", "127.0.0.1"].includes(process.env.DB_HOST));

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
      ssl: configuredSsl || (remoteDatabase ? { rejectUnauthorized: false } : undefined)
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
