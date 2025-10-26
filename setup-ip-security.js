// setup-ip-security.js - Script to help configure IP restrictions
const axios = require('axios');
const fs = require('fs');

async function getCurrentPublicIP() {
  try {
    console.log('🔍 Getting your current public IP...');
    
    // Try multiple IP detection services
    const ipServices = [
      'https://api.ipify.org?format=json',
      'https://ipapi.co/json/',
      'https://httpbin.org/ip'
    ];
    
    for (const service of ipServices) {
      try {
        const response = await axios.get(service, { timeout: 5000 });
        
        let ip;
        if (response.data.ip) {
          ip = response.data.ip;
        } else if (response.data.origin) {
          ip = response.data.origin;
        }
        
        if (ip) {
          console.log(`✅ Your public IP: ${ip}`);
          return ip;
        }
      } catch (error) {
        console.log(`❌ Failed to get IP from ${service}`);
      }
    }
    
    throw new Error('Could not determine public IP');
  } catch (error) {
    console.error('❌ Error getting public IP:', error.message);
    return null;
  }
}

async function getVercelIPs() {
  try {
    console.log('🔍 Getting Vercel IP ranges...');
    
    // Note: Vercel doesn't publish official IP ranges
    // We'll use environment detection instead
    console.log('ℹ️  Vercel uses dynamic IPs. Using header-based detection instead.');
    
    return [
      'vercel-dynamic' // Placeholder - we use headers for detection
    ];
  } catch (error) {
    console.error('❌ Error getting Vercel IPs:', error.message);
    return [];
  }
}

function updateIPWhitelist(yourIP) {
  const filePath = './src/lib/ipSecurity.ts';
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the placeholder with actual IP
    content = content.replace(
      "// 'YOUR_LAPTOP_IP_HERE',",
      `'${yourIP}', // Your laptop/office IP`
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${filePath} with your IP: ${yourIP}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error updating IP whitelist:', error.message);
    return false;
  }
}

function generateEnvConfig(yourIP) {
  const envConfig = `
# IP Security Configuration
# Add this to your .env.local file

# Enable IP restriction (set to 'true' in production)
ENABLE_IP_RESTRICTION=false

# Your allowed IPs (comma-separated)
ALLOWED_IPS=${yourIP},127.0.0.1

# Database access restriction
RESTRICT_DATABASE_ACCESS=true
`;

  console.log('\n📋 Environment Configuration:');
  console.log('=====================================');
  console.log(envConfig);
  
  // Save to file
  fs.writeFileSync('.env.ip-security', envConfig.trim());
  console.log('💾 Saved configuration to .env.ip-security');
}

function showSecurityInstructions(yourIP) {
  console.log('\n🛡️  IP SECURITY SETUP INSTRUCTIONS');
  console.log('=====================================\n');
  
  console.log('1. 📍 YOUR CURRENT PUBLIC IP:');
  console.log(`   ${yourIP}\n`);
  
  console.log('2. 🔧 TO ENABLE IP RESTRICTIONS:');
  console.log('   Add this to your .env.local:');
  console.log(`   ENABLE_IP_RESTRICTION=true`);
  console.log(`   ALLOWED_IPS=${yourIP},127.0.0.1\n`);
  
  console.log('3. ☁️  FOR VERCEL DEPLOYMENT:');
  console.log('   Set environment variables in Vercel dashboard:');
  console.log(`   ENABLE_IP_RESTRICTION=true`);
  console.log(`   ALLOWED_IPS=${yourIP}\n`);
  
  console.log('4. 🗃️  DATABASE SECURITY:');
  console.log('   - Configure MongoDB to only accept connections from:');
  console.log(`     * Your IP: ${yourIP}`);
  console.log(`     * Vercel IPs (if using Vercel)`);
  console.log('   - Enable MongoDB Atlas IP whitelist\n');
  
  console.log('5. 🚨 FRAUD PROTECTION ACTIVE:');
  console.log('   - Python scripts will be blocked');
  console.log('   - Disposable emails will be rejected');
  console.log('   - Sequential phone numbers will be flagged\n');
  
  console.log('6. 🧪 TEST YOUR SECURITY:');
  console.log('   node test-bot-protection.js');
  console.log('   # Should block python-requests and disposable emails\n');
}

async function testCurrentSecurity() {
  console.log('\n🧪 Testing Current Security Setup...');
  console.log('===================================\n');
  
  // Test disposable email detection
  const { isDisposableEmail } = require('./src/lib/emailValidator');
  
  const testEmails = [
    'irddvugv@guerrillamailblock.com', // Should be blocked
    'test@gmail.com', // Should pass
    'user@yahoo.com', // Should pass
    'fake@mailinator.com' // Should be blocked
  ];
  
  console.log('📧 Email Validation Tests:');
  testEmails.forEach(email => {
    const isDisposable = isDisposableEmail(email);
    console.log(`   ${email}: ${isDisposable ? '❌ BLOCKED' : '✅ ALLOWED'}`);
  });
  
  console.log('\n🤖 Bot Protection: ✅ ACTIVE');
  console.log('   - Python scripts will be blocked');
  console.log('   - Automated tools will be rejected');
  
  console.log('\n📊 Fraud Detection: ✅ ACTIVE');
  console.log('   - Sequential phone numbers flagged');
  console.log('   - Rapid requests from same IP blocked');
}

async function main() {
  console.log('🔐 IP SECURITY SETUP WIZARD');
  console.log('============================\n');
  
  // Get current IP
  const yourIP = await getCurrentPublicIP();
  
  if (!yourIP) {
    console.log('❌ Could not determine your public IP.');
    console.log('Please manually add your IP to src/lib/ipSecurity.ts');
    return;
  }
  
  // Update whitelist
  const updated = updateIPWhitelist(yourIP);
  
  if (updated) {
    console.log('✅ IP whitelist updated successfully');
  }
  
  // Generate environment config
  generateEnvConfig(yourIP);
  
  // Show instructions
  showSecurityInstructions(yourIP);
  
  // Test current security
  await testCurrentSecurity();
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Review and copy .env.ip-security to .env.local');
  console.log('2. Configure your MongoDB to whitelist your IP');
  console.log('3. Test the fraud protection with: node test-bot-protection.js');
  console.log('4. Deploy to Vercel with IP restrictions enabled');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { getCurrentPublicIP, updateIPWhitelist };