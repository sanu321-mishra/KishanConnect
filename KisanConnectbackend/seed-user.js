const bcrypt = require('bcrypt');
const db = require('./db');

async function seedUser() {
  const password = '123456';
  const hash = await bcrypt.hash(password, 10);
  console.log('Generated Hash:', hash);

  try {
    // Delete crops first to avoid foreign key constraint error
    await db.query('DELETE FROM crops');
    await db.query('DELETE FROM users');

    // Insert a new user with a valid bcrypt hash
    await db.query(`
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
    `, ['Ravi Kumar', 'ravi@example.com', hash]);

    console.log('✅ User seeded successfully');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    process.exit();
  }
}

seedUser();
