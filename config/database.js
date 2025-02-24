// config/database.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'balcarce186',
  database: 'Verduleria',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function connectDB() {
  try {
    const connection = await pool.getConnection();
    console.log('Conectado a MariaDB correctamente');
    connection.release();
  } catch (error) {
    console.error('No se pudo conectar a MariaDB:', error);
    process.exit(1);
  }
}

module.exports = {
  connectDB,
  pool
};
