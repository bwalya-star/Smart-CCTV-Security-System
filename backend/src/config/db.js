const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cctv_security_system',
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