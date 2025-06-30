// Script to create an admin user
const bcrypt = require('bcrypt');
const db = require('./db');

async function createAdminUser() {
  try {
    // Admin user details
    const adminData = {
      name: 'Admin User',
      email: 'admin@kisanconnect.com',
      password: 'admin123',
      role: 'admin'
    };

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Check if admin already exists
    const checkResult = await db.query('SELECT * FROM users WHERE email = $1', [adminData.email]);
    
    if (checkResult.rows.length > 0) {
      console.log('❌ Admin user already exists with email:', adminData.email);
      return;
    }

    // Insert admin user
    const result = await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [adminData.name, adminData.email, hashedPassword, adminData.role]
    );

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('👤 Role:', adminData.role);
    console.log('🆔 User ID:', result.rows[0].id);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    // Close the database connection
    await db.end();
  }
}

// Run the script
createAdminUser(); 