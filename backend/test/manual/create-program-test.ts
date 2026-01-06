import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:3000/api';
let authToken = '';

async function runTest() {
  console.log('🏁 Starting Create Program Test...');

  try {
    // 1. Login to get token
    console.log('\n1. Logging in...');
    // Assumes user created in auth-profile-flow exists or creates a new one
    // For simplicity, let's create a new user for this test
    const timestamp = new Date().getTime();
    const email = `program${timestamp}@example.com`;
    const password = 'Password123!';
    
    try {
      const registerRes = await axios.post(`${BASE_URL}/auth/register`, {
        email,
        password,
        name: 'Program Tester'
      });
      authToken = registerRes.data.accessToken;
      console.log('✅ Login successful, token received');
    } catch (error: any) {
      console.error('❌ Login/Register failed:', error.response?.data || error.message);
      return;
    }

    // 2. Create Program
    console.log('\n2. Creating Workout Program...');
    const programData = {
      name: `Test Program ${timestamp}`,
      description: "A test program created by automation",
      durationWeeks: 4,
      microcycles: [
        {
          name: "Microcycle 1",
          durationWeeks: 4,
          orderIndex: 0,
          sessions: [
            {
              name: "Session A",
              dayOfWeek: 1,
              orderIndex: 0,
              exercises: [
                {
                  exerciseId: "uuid-placeholder", // This should be a real ID if validation checks it, but for now checking structure
                  sets: 3,
                  reps: 10,
                  orderIndex: 0
                }
              ]
            }
          ]
        }
      ]
    };

    // Note: This might fail if exerciseId validation checks DB existence and we don't have seeds.
    // However, let's try to send it and see validation errors.
    
    try {
      const createRes = await axios.post(`${BASE_URL}/workout-programs`, programData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Create Program successful');
      console.log('Program ID:', createRes.data.id);
    } catch (error: any) {
      console.error('❌ Create Program failed:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

runTest();

export {};
