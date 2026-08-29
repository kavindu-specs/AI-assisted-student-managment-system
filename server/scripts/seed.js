require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'sql', 'seed.sql'), 'utf8');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  console.log('Running seed.sql against MySQL...');
  await connection.query(sql);
  console.log('Seed data applied successfully.');
  await connection.end();
}

run().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
