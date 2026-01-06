// scripts/verify-setup.js

const API_URL = 'http://localhost:3000/api';

async function verifySetup() {
  console.log('Starting system verification...');

  // 1. Check Health
  try {
    const healthRes = await fetch(`${API_URL}/health`);
    if (healthRes.ok) {
        console.log('✅ Backend Health Check: PASSED');
    } else {
        console.error(`❌ Backend Health Check: FAILED (${healthRes.status})`);
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Backend Health Check: CONNECTION FAILED');
    console.error(error.message);
    process.exit(1);
  }

  // 2. Register Test User
  const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'Password123!',
    name: 'Test User'
  };

  try {
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    if (registerRes.ok) {
      console.log('✅ User Registration: PASSED');
    } else {
      const errorData = await registerRes.json();
      console.error(`❌ User Registration: FAILED (${registerRes.status})`, errorData);
    }
  } catch (error) {
    console.error('❌ User Registration: CONNECTION FAILED');
    console.error(error.message);
  }

  // 3. Login Test User
  try {
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    if (loginRes.ok) {
      const data = await loginRes.json();
      if (data.accessToken) {
        console.log('✅ User Login: PASSED');
      } else {
        console.error('❌ User Login: FAILED (No token received)');
      }
    } else {
        const errorData = await loginRes.json();
        console.error(`❌ User Login: FAILED (${loginRes.status})`, errorData);
    }
  } catch (error) {
    console.error('❌ User Login: CONNECTION FAILED');
    console.error(error.message);
  }
}

verifySetup();

