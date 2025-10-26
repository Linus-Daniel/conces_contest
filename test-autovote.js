// test-autovote.js - Test the auto vote functionality
const axios = require('axios');

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const PROJECT_ID = '68e6de5b6b6efc411ac95a8d';

async function testAutoVote() {
  console.log('🧪 TESTING AUTO VOTE FUNCTIONALITY');
  console.log('==================================\n');
  
  console.log(`📍 API URL: ${BASE_URL}`);
  console.log(`🏆 Project ID: ${PROJECT_ID}`);
  console.log(`⏰ Test Time: ${new Date().toLocaleString()}\n`);
  
  try {
    // Test 1: Single vote increment
    console.log('🔄 Test 1: Single auto vote...');
    const response1 = await axios.post(
      `${BASE_URL}/api/projects/${PROJECT_ID}/vote`,
      { increment: 1 },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
        validateStatus: () => true // Don't throw on any status
      }
    );
    
    console.log(`📊 Status: ${response1.status}`);
    console.log(`📝 Response:`, JSON.stringify(response1.data, null, 2));
    
    if (response1.status === 200 && response1.data.success) {
      console.log('✅ Test 1 PASSED: Single vote successful');
      console.log(`   New vote count: ${response1.data.newVoteCount}`);
    } else {
      console.log('❌ Test 1 FAILED: Single vote failed');
      return false;
    }
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 2: Multiple vote increment
    console.log('\n🔄 Test 2: Multiple vote increment...');
    const response2 = await axios.post(
      `${BASE_URL}/api/projects/${PROJECT_ID}/vote`,
      { increment: 5 },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
        validateStatus: () => true
      }
    );
    
    console.log(`📊 Status: ${response2.status}`);
    console.log(`📝 Response:`, JSON.stringify(response2.data, null, 2));
    
    if (response2.status === 200 && response2.data.success) {
      console.log('✅ Test 2 PASSED: Multiple vote increment successful');
      console.log(`   Votes added: ${response2.data.increment}`);
      console.log(`   New vote count: ${response2.data.newVoteCount}`);
    } else {
      console.log('❌ Test 2 FAILED: Multiple vote increment failed');
      return false;
    }
    
    // Test 3: Default increment (no body)
    console.log('\n🔄 Test 3: Default increment...');
    const response3 = await axios.post(
      `${BASE_URL}/api/projects/${PROJECT_ID}/vote`,
      {},
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
        validateStatus: () => true
      }
    );
    
    console.log(`📊 Status: ${response3.status}`);
    console.log(`📝 Response:`, JSON.stringify(response3.data, null, 2));
    
    if (response3.status === 200 && response3.data.success) {
      console.log('✅ Test 3 PASSED: Default increment successful');
      console.log(`   Default increment: ${response3.data.increment}`);
      console.log(`   New vote count: ${response3.data.newVoteCount}`);
    } else {
      console.log('❌ Test 3 FAILED: Default increment failed');
      return false;
    }
    
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Auto vote functionality is working correctly');
    
    return true;
    
  } catch (error) {
    console.error('❌ TEST FAILED WITH ERROR:');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Connection refused - make sure your server is running on', BASE_URL);
    } else if (error.code === 'ENOTFOUND') {
      console.error('🌐 DNS lookup failed - check your API URL');
    } else if (error.response) {
      console.error(`📊 HTTP ${error.response.status}: ${error.response.statusText}`);
      console.error('📝 Response:', error.response.data);
    } else {
      console.error('❓ Unknown error:', error.message);
    }
    
    return false;
  }
}

async function testAutoVoteScript() {
  console.log('\n🤖 TESTING AUTO VOTE SCRIPT');
  console.log('============================\n');
  
  try {
    console.log('📍 Testing autovote.ts script...');
    
    // Import the auto vote functions
    const { sendVote } = require('./autovote.ts');
    
    console.log('🔄 Sending test vote via autovote script...');
    const result = await sendVote();
    
    if (result) {
      console.log('✅ Auto vote script is working correctly');
    } else {
      console.log('❌ Auto vote script failed');
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Auto vote script test failed:', error.message);
    
    if (error.message.includes('Cannot find module')) {
      console.log('ℹ️  Note: autovote.ts requires TypeScript compilation');
      console.log('   You can test it with: npx tsx autovote.ts');
    }
    
    return false;
  }
}

async function quickVoteTest() {
  console.log('⚡ QUICK VOTE TEST');
  console.log('==================\n');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/api/projects/${PROJECT_ID}/vote`,
      { increment: 1 },
      { timeout: 5000, validateStatus: () => true }
    );
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Quick test PASSED');
      console.log(`   Current votes: ${response.data.newVoteCount}`);
      console.log(`   Project: ${response.data.project.title}`);
      return true;
    } else {
      console.log('❌ Quick test FAILED');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Quick test ERROR:', error.message);
    return false;
  }
}

// CLI interface
async function main() {
  const command = process.argv[2] || 'full';
  
  console.log('🗳️  AUTO VOTE FUNCTIONALITY TEST');
  console.log('================================\n');
  
  switch (command) {
    case 'quick':
      await quickVoteTest();
      break;
    case 'script':
      await testAutoVoteScript();
      break;
    case 'full':
    default:
      await testAutoVote();
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testAutoVote, quickVoteTest };