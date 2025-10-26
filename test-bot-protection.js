// test-bot-protection.js - Test script to verify anti-bot protection
const axios = require('axios');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_PROJECT_ID = "68e3f0f493d1f4da4ef4ae01";
const TEST_PHONE = "+2348012345678";
const TEST_EMAIL = "test@example.com";

// Test different user agents
const TEST_USER_AGENTS = [
  {
    name: "Python Requests (Should be blocked)",
    userAgent: "python-requests/2.32.3",
    shouldBlock: true
  },
  {
    name: "cURL (Should be blocked)",
    userAgent: "curl/7.68.0",
    shouldBlock: true
  },
  {
    name: "Legitimate Chrome Browser (Should pass)",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    shouldBlock: false
  },
  {
    name: "Legitimate Safari Browser (Should pass)",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    shouldBlock: false
  },
  {
    name: "Empty User Agent (Should be blocked)",
    userAgent: "",
    shouldBlock: true
  },
  {
    name: "Short suspicious User Agent (Should be blocked)",
    userAgent: "Bot",
    shouldBlock: true
  }
];

async function testEndpoint(endpoint, method, data, userAgent, testName) {
  try {
    console.log(`\n🧪 Testing: ${testName}`);
    console.log(`📍 Endpoint: ${method} ${endpoint}`);
    console.log(`🤖 User Agent: "${userAgent}"`);
    
    const config = {
      method,
      url: endpoint,
      headers: {
        'User-Agent': userAgent,
        'Content-Type': 'application/json'
      },
      timeout: 5000,
      validateStatus: () => true // Don't throw on any status code
    };
    
    if (method === 'POST' && data) {
      config.data = data;
    }
    
    const response = await axios(config);
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📝 Response: ${JSON.stringify(response.data, null, 2)}`);
    
    return {
      status: response.status,
      data: response.data,
      blocked: response.status === 403 && response.data.code === 'BOT_DETECTED'
    };
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return {
      status: 'ERROR',
      error: error.message,
      blocked: false
    };
  }
}

async function runBotProtectionTests() {
  console.log('🛡️  ANTI-BOT PROTECTION TEST SUITE');
  console.log('====================================\n');
  
  const results = [];
  
  // Test endpoints to check
  const endpoints = [
    {
      path: '/api/vote/request-otp',
      method: 'POST',
      data: { projectId: TEST_PROJECT_ID, voterPhone: TEST_PHONE }
    },
    {
      path: '/api/vote/request-otp-email',
      method: 'POST',
      data: { projectId: TEST_PROJECT_ID, voterEmail: TEST_EMAIL, voterPhone: TEST_PHONE }
    },
    {
      path: '/api/vote/check-otp',
      method: 'POST',
      data: { phoneNumber: TEST_PHONE }
    },
    {
      path: '/api/vote/check-otp-email',
      method: 'POST',
      data: { email: TEST_EMAIL, phoneNumber: TEST_PHONE }
    }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n🎯 Testing endpoint: ${endpoint.path}`);
    console.log('=' * 50);
    
    for (const test of TEST_USER_AGENTS) {
      const result = await testEndpoint(
        `${BASE_URL}${endpoint.path}`,
        endpoint.method,
        endpoint.data,
        test.userAgent,
        test.name
      );
      
      const testPassed = test.shouldBlock ? result.blocked : !result.blocked;
      
      results.push({
        endpoint: endpoint.path,
        testName: test.name,
        userAgent: test.userAgent,
        shouldBlock: test.shouldBlock,
        actuallyBlocked: result.blocked,
        status: result.status,
        passed: testPassed
      });
      
      if (testPassed) {
        console.log(`✅ PASS: ${test.shouldBlock ? 'Correctly blocked' : 'Correctly allowed'}`);
      } else {
        console.log(`❌ FAIL: ${test.shouldBlock ? 'Should have been blocked but was not' : 'Should have been allowed but was blocked'}`);
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // Generate test report
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('=======================\n');
  
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} ✅`);
  console.log(`Failed: ${failedTests} ❌`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);
  
  if (failedTests > 0) {
    console.log('❌ FAILED TESTS:');
    results.filter(r => !r.passed).forEach(result => {
      console.log(`   - ${result.endpoint}: ${result.testName}`);
      console.log(`     Expected: ${result.shouldBlock ? 'BLOCK' : 'ALLOW'}, Got: ${result.actuallyBlocked ? 'BLOCKED' : 'ALLOWED'}`);
    });
  }
  
  // Check for Python requests specifically
  const pythonTests = results.filter(r => r.userAgent.includes('python-requests'));
  const pythonBlocked = pythonTests.filter(r => r.actuallyBlocked).length;
  
  console.log(`\n🐍 Python Requests Protection: ${pythonBlocked}/${pythonTests.length} blocked`);
  
  if (pythonBlocked === pythonTests.length) {
    console.log('✅ All Python requests successfully blocked!');
  } else {
    console.log('❌ Some Python requests were not blocked - check configuration!');
  }
  
  return {
    totalTests,
    passedTests,
    failedTests,
    successRate: (passedTests / totalTests) * 100,
    pythonBlocked: pythonBlocked === pythonTests.length
  };
}

// Quick test function for manual verification
async function quickPythonTest() {
  console.log('🚀 Quick Python Request Test');
  console.log('============================\n');
  
  const result = await testEndpoint(
    `${BASE_URL}/api/vote/request-otp`,
    'POST',
    { projectId: TEST_PROJECT_ID, voterPhone: TEST_PHONE },
    'python-requests/2.32.3',
    'Python Script Attack Simulation'
  );
  
  if (result.blocked) {
    console.log('✅ SUCCESS: Python request was blocked!');
    console.log('🛡️  Anti-bot protection is working correctly.');
  } else {
    console.log('❌ FAILURE: Python request was NOT blocked!');
    console.log('⚠️  Anti-bot protection may not be working correctly.');
  }
  
  return result.blocked;
}

// Run tests based on command line argument
if (require.main === module) {
  const testType = process.argv[2] || 'full';
  
  if (testType === 'quick') {
    quickPythonTest().then(success => {
      process.exit(success ? 0 : 1);
    });
  } else {
    runBotProtectionTests().then(results => {
      process.exit(results.failedTests === 0 ? 0 : 1);
    });
  }
}

module.exports = { runBotProtectionTests, quickPythonTest };