// decrypt-fraud-votes.js - Script to decrypt voter data for fraud investigation
const crypto = require('crypto');
const fs = require('fs');

// Decryption function (same as used in the voting system)
function decrypt(encryptedData) {
  try {
    const algorithm = "aes-256-gcm";
    const keyString = "your-32-char-secret-key-here123";
    const key = crypto.createHash("sha256").update(keyString).digest();
    
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed for:', encryptedData.substring(0, 20) + '...');
    return null;
  }
}

// Sample encrypted vote data (from your investigation)
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
    "_id": "68f929fbbf0b7dcbd4bc5759",
    "phoneNumber": "2c85da64e0de4eeec69ac22ca4916f46:894a4224694d19f241bf94849d4b83e7:e9ff8323f09c887e02321fb0f589",
    "voterEmail": "d96e5d141bc6ce07cb2d4531b41edd75:85afe8760172ea74684b9936a132a23a:b596e868ada569e0ead260d8077e84104576968e5ec662",
    "projectId": "68e3f0f493d1f4da4ef4ae01",
    "otpId": "68f929daa4080bac9e0c9e76",
    "ipAddress": "102.91.102.56",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36",
    "votedAt": "2025-10-22T19:01:15.192Z"
  },
  {
    "_id": "68fa50feecce1365d222bbe0",
    "phoneNumber": "5da381477746dfbe3b0d0e5f7cfb608f:26881325ececb8156471415b894b305c:243d54a165d9dd75ef4abd853fbb",
    "voterEmail": "61e34fa912f4da2d31836e3b76f3d48d:67bc20f5708cca809e7ea42feb2299bf:bef9a7fdf999c4fd472144a0c1d8a348b33a277ac387778938",
    "projectId": "68e3f0f493d1f4da4ef4ae01",
    "otpId": "68fa50dc1d5170f5fd7b71cf",
    "ipAddress": "188.241.179.242",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
    "votedAt": "2025-10-23T15:59:58.463Z"
  },
  // Python script votes (suspicious pattern)
  {
    "_id": "68fb9345faf495e238900d9e",
    "phoneNumber": "138cecc5902aeb462a88a79a1910ec15:8ac795c68dbe7357f9d0908149c32461:301d3423c95caf37f97e3c2fc7ac",
    "voterEmail": "9ba087c24bcfc52b9b02727dd7f4d3e0:96d8f6a8a7376209f56f7b4c2e8510f2:b19b1a6691f83ea4bde793880f025b816cd3c55d0f13fce35d4b826214b8ef",
    "projectId": "68e3f0f493d1f4da4ef4ae01",
    "otpId": "68fb9333faf495e238900d97",
    "ipAddress": "102.91.102.192",
    "userAgent": "python-requests/2.32.3", // SUSPICIOUS: Python script
    "votedAt": "2025-10-24T14:55:01.254Z"
  },
  {
    "_id": "68fb93d17032819aa2832429",
    "phoneNumber": "716c38710a68e6ccf8b63a00b94fed26:871d328c8d03be89bbd3fa66c0626426:d26afa7fb70dcf86e039ffd277b5",
    "voterEmail": "51284f9b4cfb63a6775ca927d32f5584:b4c36826d293cced06e99ebd782885ea:45e5f39b6dcfbd1ae6f2c266b438ef7ba5cd11e354a24624fe0b7b2cae65c1",
    "projectId": "68e3f0f493d1f4da4ef4ae01",
    "otpId": "68fb93c57032819aa283240b",
    "ipAddress": "102.91.102.192",
    "userAgent": "python-requests/2.32.3", // SUSPICIOUS: Python script
    "votedAt": "2025-10-24T14:57:21.988Z"
  }
];

// Analyze and decrypt suspicious votes
function analyzeFraudulentVotes() {
  console.log('🔍 FRAUD INVESTIGATION REPORT');
  console.log('=====================================\n');
  
  const decryptedVotes = [];
  const suspiciousPatterns = {
    pythonUserAgents: [],
    sameIP: {},
    rapidVoting: []
  };
  
  suspiciousVotes.forEach((vote, index) => {
    console.log(`📋 Vote #${index + 1} (ID: ${vote._id})`);
    
    // Decrypt phone and email
    const decryptedPhone = decrypt(vote.phoneNumber);
    const decryptedEmail = decrypt(vote.voterEmail);
    
    const decryptedVote = {
      ...vote,
      decryptedPhone,
      decryptedEmail
    };
    
    decryptedVotes.push(decryptedVote);
    
    // Check for suspicious patterns
    if (vote.userAgent.includes('python-requests')) {
      suspiciousPatterns.pythonUserAgents.push(decryptedVote);
      console.log('🚨 ALERT: Python script detected!');
    }
    
    // Track IP addresses
    if (!suspiciousPatterns.sameIP[vote.ipAddress]) {
      suspiciousPatterns.sameIP[vote.ipAddress] = [];
    }
    suspiciousPatterns.sameIP[vote.ipAddress].push(decryptedVote);
    
    console.log(`📞 Phone: ${decryptedPhone || 'DECRYPTION FAILED'}`);
    console.log(`📧 Email: ${decryptedEmail || 'DECRYPTION FAILED'}`);
    console.log(`🌐 IP: ${vote.ipAddress}`);
    console.log(`🖥️  User Agent: ${vote.userAgent}`);
    console.log(`⏰ Voted At: ${vote.votedAt}`);
    console.log('-'.repeat(50));
  });
  
  // Generate fraud analysis report
  console.log('\n🚨 FRAUD ANALYSIS SUMMARY');
  console.log('=========================\n');
  
  // Python script votes
  if (suspiciousPatterns.pythonUserAgents.length > 0) {
    console.log(`⚠️  ${suspiciousPatterns.pythonUserAgents.length} votes from Python scripts detected:`);
    suspiciousPatterns.pythonUserAgents.forEach(vote => {
      console.log(`   - Phone: ${vote.decryptedPhone}, Email: ${vote.decryptedEmail}, IP: ${vote.ipAddress}`);
    });
    console.log('');
  }
  
  // Multiple votes from same IP
  Object.entries(suspiciousPatterns.sameIP).forEach(([ip, votes]) => {
    if (votes.length > 1) {
      console.log(`🔄 ${votes.length} votes from IP ${ip}:`);
      votes.forEach(vote => {
        console.log(`   - ${vote.decryptedPhone} (${vote.decryptedEmail}) at ${vote.votedAt}`);
      });
      console.log('');
    }
  });
  
  // Save results to file
  const report = {
    investigationDate: new Date().toISOString(),
    totalVotesAnalyzed: suspiciousVotes.length,
    pythonScriptVotes: suspiciousPatterns.pythonUserAgents.length,
    suspiciousIPs: Object.keys(suspiciousPatterns.sameIP).filter(ip => 
      suspiciousPatterns.sameIP[ip].length > 1
    ),
    decryptedVotes
  };
  
  fs.writeFileSync('fraud-investigation-report.json', JSON.stringify(report, null, 2));
  console.log('📄 Full report saved to: fraud-investigation-report.json');
  
  return report;
}

// // Run the analysis if encryption key is available
// if (process.env.ENCRYPTION_KEY) {
// } else {
//   console.log('⚠️  ENCRYPTION_KEY environment variable not set');
//   console.log('Please set it to decrypt the voter data:');
//   console.log('export ENCRYPTION_KEY="your-32-char-secret-key-here123"');
//   console.log('node decrypt-fraud-votes.js');
// }
analyzeFraudulentVotes();

module.exports = { decrypt, analyzeFraudulentVotes };