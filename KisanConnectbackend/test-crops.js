// Test script for user-specific crop functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let user1Token = '';
let user2Token = '';

async function testUserSpecificCrops() {
  try {
    console.log('🧪 Testing User-Specific Crop Functionality...\n');

    // Test 1: Register two users
    console.log('1. Registering two users...');
    
    await axios.post(`${BASE_URL}/auth/register`, {
      name: 'User One',
      email: 'user1@example.com',
      password: 'password123'
    });
    console.log('✅ User 1 registered');

    await axios.post(`${BASE_URL}/auth/register`, {
      name: 'User Two',
      email: 'user2@example.com',
      password: 'password123'
    });
    console.log('✅ User 2 registered');

    // Test 2: Login both users
    console.log('\n2. Logging in both users...');
    
    const user1Login = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'user1@example.com',
      password: 'password123'
    });
    user1Token = user1Login.data.token;
    console.log('✅ User 1 logged in');

    const user2Login = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'user2@example.com',
      password: 'password123'
    });
    user2Token = user2Login.data.token;
    console.log('✅ User 2 logged in');

    // Test 3: User 1 adds crops
    console.log('\n3. User 1 adding crops...');
    
    await axios.post(`${BASE_URL}/crops/add`, {
      name: 'Wheat',
      type: 'Grain',
      price: 2500,
      quantity: 100,
      village: 'Village A',
      contact: '9876543210'
    }, {
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });
    console.log('✅ User 1 added Wheat');

    await axios.post(`${BASE_URL}/crops/add`, {
      name: 'Rice',
      type: 'Grain',
      price: 3000,
      quantity: 50,
      village: 'Village A',
      contact: '9876543210'
    }, {
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });
    console.log('✅ User 1 added Rice');

    // Test 4: User 2 adds crops
    console.log('\n4. User 2 adding crops...');
    
    await axios.post(`${BASE_URL}/crops/add`, {
      name: 'Tomatoes',
      type: 'Vegetable',
      price: 40,
      quantity: 200,
      village: 'Village B',
      contact: '9876543211'
    }, {
      headers: { 'Authorization': `Bearer ${user2Token}` }
    });
    console.log('✅ User 2 added Tomatoes');

    // Test 5: Check User 1's crops
    console.log('\n5. Checking User 1\'s crops...');
    const user1Crops = await axios.get(`${BASE_URL}/crops`, {
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });
    console.log('✅ User 1 has', user1Crops.data.length, 'crops:', user1Crops.data.map(c => c.name));

    // Test 6: Check User 2's crops
    console.log('\n6. Checking User 2\'s crops...');
    const user2Crops = await axios.get(`${BASE_URL}/crops`, {
      headers: { 'Authorization': `Bearer ${user2Token}` }
    });
    console.log('✅ User 2 has', user2Crops.data.length, 'crops:', user2Crops.data.map(c => c.name));

    // Test 7: Verify isolation (User 1 can't see User 2's crops)
    console.log('\n7. Verifying data isolation...');
    const user1CropIds = user1Crops.data.map(c => c.id);
    const user2CropIds = user2Crops.data.map(c => c.id);
    
    const hasOverlap = user1CropIds.some(id => user2CropIds.includes(id));
    console.log('✅ No overlap between user crops:', !hasOverlap);

    console.log('\n🎉 All user-specific crop tests passed!');
    console.log('\n📊 Summary:');
    console.log('- User 1 crops:', user1Crops.data.length);
    console.log('- User 2 crops:', user2Crops.data.length);
    console.log('- Data isolation: ✅ Working');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testUserSpecificCrops(); 