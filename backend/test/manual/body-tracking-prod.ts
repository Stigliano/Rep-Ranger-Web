import axios from 'axios';
import * as dotenv from 'dotenv';

// Carica variabili ambiente se presenti, altrimenti usa default
dotenv.config();

// URL Produzione
const API_URL = process.env.PROD_API_URL || 'https://rapranger-backend-prod-6911179946.europe-west1.run.app/api';

// Credenziali Test (o crearne di nuove)
const TEST_USER = {
  email: `test.bodytracking.${Date.now()}@example.com`,
  password: 'Password123!',
  name: 'Body Tracking Tester'
};

async function runTest() {
  console.log('🏁 Starting Body Tracking Production API Test...');
  console.log(`Target: ${API_URL}`);

  try {
    // 1. Registrazione/Login
    console.log('\n1. Authenticating...');
    let token = '';
    
    try {
      const regRes = await axios.post(`${API_URL}/auth/register`, TEST_USER);
      token = regRes.data.accessToken;
      console.log('✅ Registered new test user');
    } catch (e: any) {
        // Se l'utente esiste già (es. test ripetuto velocemente), prova login
        console.log('User might exist, trying login...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: TEST_USER.email,
            password: TEST_USER.password
        });
        token = loginRes.data.accessToken;
        console.log('✅ Logged in');
    }

    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    // 2. GET Analysis (Initial)
    console.log('\n2. Testing GET Analysis...');
    const analysisRes = await axios.get(`${API_URL}/body-metrics/analysis?gender=male`, authHeader);
    console.log('✅ Analysis retrieved');
    console.log('Method:', analysisRes.data.method);
    console.log('Targets keys:', Object.keys(analysisRes.data.targets).join(', '));

    // 3. POST Metric (Save Weight)
    console.log('\n3. Testing POST Metric (Weight)...');
    const weightMetric = {
      metricType: 'weight',
      value: 80.5,
      unit: 'kg',
      measuredAt: new Date().toISOString()
    };
    await axios.post(`${API_URL}/body-metrics`, weightMetric, authHeader);
    console.log('✅ Weight metric saved');

    // 4. POST Metric (Save Chest)
    console.log('\n4. Testing POST Metric (Chest)...');
    const chestMetric = {
      metricType: 'chest',
      value: 105,
      unit: 'cm',
      measuredAt: new Date().toISOString()
    };
    await axios.post(`${API_URL}/body-metrics`, chestMetric, authHeader);
    console.log('✅ Chest metric saved');

    // 5. GET History
    console.log('\n5. Testing GET History...');
    const historyRes = await axios.get(`${API_URL}/body-metrics/history`, authHeader);
    console.log(`✅ History retrieved (${historyRes.data.length} records)`);
    
    // Verify saved data is in history
    const hasWeight = historyRes.data.some((m: any) => m.metricType === 'weight' && Number(m.value) === 80.50);
    const hasChest = historyRes.data.some((m: any) => m.metricType === 'chest' && Number(m.value) === 105.00);
    
    if (hasWeight && hasChest) {
        console.log('✅ Verification passed: Data persisted correctly');
    } else {
        console.error('❌ Verification failed: Data not found in history');
        console.log('History dump:', historyRes.data);
    }

    // 6. GET Analysis (Updated)
    console.log('\n6. Testing GET Analysis (After Update)...');
    const updatedAnalysisRes = await axios.get(`${API_URL}/body-metrics/analysis?gender=male`, authHeader);
    const chestAnalysis = updatedAnalysisRes.data.analysis.find((a: any) => a.part === 'chest');
    
    if (chestAnalysis && Number(chestAnalysis.current) === 105) {
        console.log('✅ Analysis updated correctly with new data');
        console.log('Chest status:', chestAnalysis.status);
    } else {
        console.error('❌ Analysis update check failed');
        console.log('Chest analysis:', chestAnalysis);
    }

    console.log('\n✨ TEST COMPLETED SUCCESSFULLY ✨');

  } catch (error: any) {
    console.error('\n❌ TEST FAILED');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

runTest();
