const mysql = require('mysql2/promise');

// Create pool
const pool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_SCHEMA,
	waitForConnections: true,
	connectionLimit: process.env.DB_CONNECTION_LIMIT,
	queueLimit: 0,
});

console.log("Mysql is connected");


async function queryDB(sql, params) {
	try {
		const result = await pool.query(sql, params)
		return result[0];
	} catch (error) {
		throw error;
	}
}

module.exports = { queryDB }; 