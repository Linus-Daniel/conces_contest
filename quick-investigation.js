// quick-investigation.js - Quick fraud investigation using provided data
const crypto = require('crypto');
const fs = require('fs');

// Decryption function
function decrypt(encryptedData) {
  try {
    if (!encryptedData || typeof encryptedData !== 'string') {
      return null;
    }

    const algorithm = "aes-256-gcm";
    const keyString = process.env.ENCRYPTION_KEY || "your-32-char-secret-key-here123";
    const key = crypto.createHash("sha256").update(keyString).digest();
    
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
    if (!ivHex || !authTagHex || !encrypted) {
      return null;
    }

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error.message);
    return 'DECRYPTION_FAILED';
  }
}

// Your provided fraud data
const suspiciousVotes = [
  {
    "_id": "68f9284c96153c517263c378",
    "phoneNumber": "e3a4539ef06990b7c86b4f21190c6d12:67d09f803cc8a9e66891e7aabc375ecb:7d71a5b1bafd398cf51c3f584c51",
    "voterEmail": "40bdf4d0551b5e3aa9294430197347fb:b60e734edf15c9a83c3dc3831fc1bb2e:01b106349e76149320666ee5bb9f243bb0a7eb47e69c14920dbf97d037c725db",
    "projectId": "68e3f0f493d1f4da4ef4ae01",
    "otpId": "68f9281aeca23c61e5ecf000",
    "ipAddress": "102.91.102.8",
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1",
    "votedAt": "2025-10-22T18:54:04.631Z"
  },
  {
    "_id": "68fb9345faf495e238900d9e",
    "phoneNumber": "138cecc5902aeb462a88a79a1910ec15:8ac795c68dbe7357f9d0908149c32461:301d3423c95caf37f97e3c2fc7ac",
    "voterEmail": "9ba087c24bcfc52b9b02727dd7f4d3e0:96d8f6a8a7376209f56f7b4c2e8510f2:b19b1a6691f83ea4bde793880f025b816cd3c55d0f13fce35d4b826214b8ef",
    "projectId": "68e3f0f493d1f4da4ef4ae01",
    "otpId": "68fb9333faf495e238900d97",
    "ipAddress": "102.91.102.192",
    "userAgent": "python-requests/2.32.3", // FRAUD!
    "votedAt": "2025-10-24T14:55:01.254Z"
  },
  {
    "_id": "68fb93d17032819aa2832429",
    "phoneNumber": "716c38710a68e6ccf8b63a00b94fed26:871d328c8d03be89bbd3fa66c0626426:d26afa7fb70dcf86e039ffd277b5",
    "voterEmail": "51284f9b4cfb63a6775ca927d32f5584:b4c36826d293cced06e99ebd782885ea:45e5f39b6dcfbd1ae6f2c266b438ef7ba5cd11e354a24624fe0b7b2cae65c1",
    "projectId": "68e3f0f493d1f4da4ef4ae01",
    "otpId": "68fb93c57032819aa283240b",
    "ipAddress": "102.91.102.192",
    "userAgent": "python-requests/2.32.3", // FRAUD!
    "votedAt": "2025-10-24T14:57:21.988Z"
  }
];

function analyzeProvidedData() {
  console.log('🔍 QUICK FRAUD INVESTIGATION - PROVIDED DATA');
  console.log('=============================================\n');
  
  const analysis = {
    totalVotes: suspiciousVotes.length,
    pythonScriptVotes: 0,
    disposableEmailVotes: 0,
    suspiciousIPs: {},
    sequentialPhones: [],
    decryptedData: []
  };
  
  // Analyze each vote
  suspiciousVotes.forEach((vote, index) => {
    console.log(`📋 Vote #${index + 1} (ID: ${vote._id})`);
    console.log('=' .repeat(40));
    
    // Decrypt data
    const decryptedPhone = decrypt(vote.phoneNumber);
    const decryptedEmail = decrypt(vote.voterEmail);
    
    const decryptedVote = {
      ...vote,
      decryptedPhone,
      decryptedEmail
    };
    
    analysis.decryptedData.push(decryptedVote);
    
    // Check for Python scripts
    if (vote.userAgent.includes('python-requests')) {
      analysis.pythonScriptVotes++;
      console.log('🚨 FRAUD DETECTED: Python script!');
    }
    
    // Check for disposable emails
    if (decryptedEmail && decryptedEmail.includes('guerrillamailblock.com')) {
      analysis.disposableEmailVotes++;
      console.log('🚨 FRAUD DETECTED: Disposable email!');
    }
    
    // Track IP addresses
    if (!analysis.suspiciousIPs[vote.ipAddress]) {
      analysis.suspiciousIPs[vote.ipAddress] = [];
    }
    analysis.suspiciousIPs[vote.ipAddress].push(decryptedVote);
    
    console.log(`📞 Phone: ${decryptedPhone}`);
    console.log(`📧 Email: ${decryptedEmail}`);
    console.log(`🌐 IP: ${vote.ipAddress}`);
    console.log(`🖥️  User Agent: ${vote.userAgent}`);
    console.log(`⏰ Voted At: ${vote.votedAt}`);
    console.log(`🏆 Project ID: ${vote.projectId}`);
    console.log('');
  });
  
  // Check for sequential phone numbers
  const phones = analysis.decryptedData
    .map(v => v.decryptedPhone)
    .filter(p => p && p !== 'DECRYPTION_FAILED');
  
  for (let i = 0; i < phones.length - 1; i++) {
    for (let j = i + 1; j < phones.length; j++) {
      const num1 = parseInt(phones[i].replace(/\D/g, ''));
      const num2 = parseInt(phones[j].replace(/\D/g, ''));
      const diff = Math.abs(num1 - num2);
      
      if (diff < 1000 && diff > 0) {
        analysis.sequentialPhones.push({
          phone1: phones[i],
          phone2: phones[j],
          difference: diff
        });
      }
    }
  }
  
  // Generate fraud report
  console.log('🚨 FRAUD ANALYSIS SUMMARY');
  console.log('=========================\n');
  
  console.log(`📊 Total Votes Analyzed: ${analysis.totalVotes}`);
  console.log(`🤖 Python Script Votes: ${analysis.pythonScriptVotes}`);
  console.log(`📧 Disposable Email Votes: ${analysis.disposableEmailVotes}`);
  console.log(`📞 Sequential Phone Patterns: ${analysis.sequentialPhones.length}`);
  
  // IP analysis
  console.log('\n🌐 IP ADDRESS ANALYSIS:');
  Object.entries(analysis.suspiciousIPs).forEach(([ip, votes]) => {
    if (votes.length > 1) {
      console.log(`🔴 ${ip}: ${votes.length} votes (SUSPICIOUS)`);
      votes.forEach(vote => {
        console.log(`   - ${vote.decryptedPhone} at ${vote.votedAt}`);
      });
    } else {
      console.log(`🟢 ${ip}: 1 vote (normal)`);
    }
  });
  
  // Sequential phone analysis
  if (analysis.sequentialPhones.length > 0) {
    console.log('\n📞 SEQUENTIAL PHONE NUMBERS:');
    analysis.sequentialPhones.forEach(pattern => {
      console.log(`🔴 ${pattern.phone1} ↔ ${pattern.phone2} (diff: ${pattern.difference})`);
    });
  }
  
  // Generate recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('==================');
  
  if (analysis.pythonScriptVotes > 0) {
    console.log('🚨 URGENT: Remove all Python script votes immediately');
    console.log(`   Vote IDs to remove: ${suspiciousVotes.filter(v => v.userAgent.includes('python-requests')).map(v => v._id).join(', ')}`);
  }
  
  if (analysis.disposableEmailVotes > 0) {
    console.log('⚠️  HIGH: Review votes with disposable email addresses');
  }
  
  const multipleIPVotes = Object.values(analysis.suspiciousIPs).filter(votes => votes.length > 1);
  if (multipleIPVotes.length > 0) {
    console.log('⚠️  MEDIUM: Review multiple votes from same IP addresses');
  }
  
  if (analysis.sequentialPhones.length > 0) {
    console.log('⚠️  MEDIUM: Investigate sequential phone number patterns');
  }
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    analysis,
    rawData: suspiciousVotes,
    fraudScore: (analysis.pythonScriptVotes * 10) + (analysis.disposableEmailVotes * 8) + (analysis.sequentialPhones.length * 6),
    recommendations: generateRecommendations(analysis)
  };
  
  fs.writeFileSync('quick-fraud-analysis.json', JSON.stringify(report, null, 2));
  console.log('\n💾 Report saved to: quick-fraud-analysis.json');
  
  return report;
}

function generateRecommendations(analysis) {
  const recommendations = [];
  
  if (analysis.pythonScriptVotes > 0) {
    recommendations.push({
      priority: 'URGENT',
      action: 'Remove Python script votes',
      details: `${analysis.pythonScriptVotes} votes detected from automated scripts`,
      voteIds: suspiciousVotes.filter(v => v.userAgent.includes('python-requests')).map(v => v._id)
    });
  }
  
  if (analysis.disposableEmailVotes > 0) {
    recommendations.push({
      priority: 'HIGH',
      action: 'Review disposable email votes',
      details: `${analysis.disposableEmailVotes} votes using temporary email addresses`
    });
  }
  
  return recommendations;
}

// Run the analysis
if (require.main === module) {
  if (!process.env.ENCRYPTION_KEY) {
    console.log('⚠️  ENCRYPTION_KEY environment variable not set');
    console.log('Please set it to decrypt the voter data:');
    console.log('export ENCRYPTION_KEY="your-32-char-secret-key-here123"');
    console.log('node quick-investigation.js');
    process.exit(1);
  }
  
  analyzeProvidedData();
}

module.exports = { analyzeProvidedData, decrypt };