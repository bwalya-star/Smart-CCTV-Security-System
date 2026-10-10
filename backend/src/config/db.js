const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

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

// Aiven requires TLS. A supplied CA is verified strictly; without one, its
// managed certificate is accepted for the production connection.
const ssl = configuredSsl || (remoteDatabase
    ? { rejectUnauthorized: false }
    : undefined);

const connection = process.env.DATABASE_URL
    ? { uri: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'cctv_security_system'
    };

const db = mysql.createPool({
    ...connection,
    ssl,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verification check
db.getConnection()
    .then(async (connection) => {
        console.log('✅ Connected to MySQL database.');

        // Ensure the alerts table exists
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS alerts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                image_path VARCHAR(255) NOT NULL,
                detected BOOLEAN NOT NULL DEFAULT TRUE,
                confidence FLOAT DEFAULT 0.0,
                status VARCHAR(50) DEFAULT 'unknown',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await connection.query(createTableQuery);
        console.log('✅ Alert table verified/created.');

        connection.release();
    })
    .catch((err) => {
        console.error('❌ Database connection failed!');
        console.error('Error Code:', err.code);
        console.error('Message:', err.message);
    });

module.exports = db;
