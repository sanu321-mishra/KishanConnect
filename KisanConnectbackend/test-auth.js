// Test script for authentication endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/auth';

async function testAuth() {
  try {
    console.log('🧪 Testing Authentication Endpoints...\n');

    // Test 1: Register a new user
    console.log('1. Testing user registration...');
    const registerResponse = await axios.post(`${BASE_URL}/register`, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ Registration successful:', registerResponse.data);

    // Test 2: Login with the user
    console.log('\n2. Testing user login...');
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ Login successful, token received');

    const token = loginResponse.data.token;
    
    // Test 3: Get current user info
    console.log('\n3. Testing get current user...');
    const userResponse = await axios.get(`${BASE_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ User info retrieved:', userResponse.data);

    console.log('\n🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testAuth(); 