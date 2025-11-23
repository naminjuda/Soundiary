import mysql from 'mysql2/promise';
import dbConfig from '../config/db.config.js';

const pool = mysql.createPool({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    connectionLimit: dbConfig.connectionLimit,
    queueLimit: 0,
    dateStrings: true
});

// 연결 테스트
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log(`✅ MySQL Connected! (Host: ${dbConfig.host})`);
        connection.release();
    } catch (error) {
        console.error("❌ MySQL Connection Error: ", error);
        console.error("Message: ", error.message);
    }
})();

export default pool;