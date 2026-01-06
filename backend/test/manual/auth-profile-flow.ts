import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

async function runTest() {
  console.log('🏁 Starting Auth Flow Test...');

  try {
    // 1. Register
    console.log('\n1. Testing Registration...');
    const timestamp = new Date().getTime();
    const email = `test${timestamp}@example.com`;
    const password = 'Password123!';
    
    try {
      const registerRes = await axios.post(`${BASE_URL}/auth/register`, {
        email,
        password,
        name: 'Test User'
      });
      console.log('✅ Registration successful');
      authToken = registerRes.data.accessToken;
      console.log('Token received:', authToken ? 'Yes' : 'No');
    } catch (error: any) {
      console.error('❌ Registration failed:', error.response?.data || error.message);
      return;
    }

    // 2. Get Profile
    console.log('\n2. Testing Get Profile...');
    try {
      const profileRes = await axios.get(`${BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Get Profile successful');
      console.log('User ID:', profileRes.data.id);
      console.log('Name:', profileRes.data.name);
    } catch (error: any) {
      console.error('❌ Get Profile failed:', error.response?.data || error.message);
    }

    // 3. Update Profile
    console.log('\n3. Testing Update Profile...');
    try {
      const updateRes = await axios.patch(`${BASE_URL}/profile`, {
        age: 30,
        height: 180,
        athleteLevel: 'Intermediate'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Update Profile successful');
      console.log('Updated Profile:', updateRes.data.profile);
    } catch (error: any) {
      console.error('❌ Update Profile failed:', error.response?.data || error.message);
    }

    // 4. Login
    console.log('\n4. Testing Login...');
    try {
      const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
        email,
        password
      });
      console.log('✅ Login successful');
      console.log('New token received:', loginRes.data.accessToken ? 'Yes' : 'No');
    } catch (error: any) {
      console.error('❌ Login failed:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

runTest();

export {};
