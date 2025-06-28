// backend/db.js
const { Pool } = require('pg');
const db = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'Saurabh@123',
  database: 'postgres',
  port: 5432
});
module.exports = db;
