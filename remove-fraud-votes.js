// remove-fraud-votes.js - Script to remove fraudulent votes and strengthen security
const { MongoClient } = require('mongodb');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database';
const PROJECT_ID = "68e3f0f493d1f4da4ef4ae01";

// Suspicious user agents that indicate automated scripts
const SUSPICIOUS_USER_AGENTS = [
  'python-requests',
  'curl/',
  'wget/',
  'node-fetch',
  'axios',
  'urllib',
  'httpx',
  'requests'
];

async function removeFraudulentVotes() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔌 Connected to MongoDB');
    
    const db = client.db();
    const votesCollection = db.collection('votes');
    const otpCollection = db.collection('otps');
    const projectsCollection = db.collection('projects');
    
    // Find all suspicious votes (Python scripts)
    const suspiciousVotes = await votesCollection.find({
      projectId: PROJECT_ID,
      userAgent: { 
        $regex: new RegExp(SUSPICIOUS_USER_AGENTS.join('|'), 'i') 
      }
    }).toArray();
    
    console.log(`🚨 Found ${suspiciousVotes.length} suspicious votes from automated scripts`);
    
    if (suspiciousVotes.length === 0) {
      console.log('✅ No fraudulent votes found');
      return;
    }
    
    // Display suspicious votes before removal
    console.log('\n📋 Suspicious votes to be removed:');
    suspiciousVotes.forEach((vote, index) => {
      console.log(`${index + 1}. Vote ID: ${vote._id}`);
      console.log(`   IP: ${vote.ipAddress}`);
      console.log(`   User Agent: ${vote.userAgent}`);
      console.log(`   Voted At: ${vote.votedAt}`);
      console.log(`   OTP ID: ${vote.otpId}`);
      console.log('');
    });
    
    // Get OTP IDs for cleanup
    const otpIds = suspiciousVotes.map(vote => vote.otpId).filter(Boolean);
    
    // Remove fraudulent votes
    const voteDeleteResult = await votesCollection.deleteMany({
      _id: { $in: suspiciousVotes.map(vote => vote._id) }
    });
    
    console.log(`🗑️  Removed ${voteDeleteResult.deletedCount} fraudulent votes`);
    
    // Remove associated OTPs
    if (otpIds.length > 0) {
      const otpDeleteResult = await otpCollection.deleteMany({
        _id: { $in: otpIds }
      });
      console.log(`🗑️  Removed ${otpDeleteResult.deletedCount} associated OTPs`);
    }
    
    // Update project vote count
    const remainingVotesCount = await votesCollection.countDocuments({
      projectId: PROJECT_ID
    });
    
    await projectsCollection.updateOne(
      { _id: PROJECT_ID },
      { $set: { vote: remainingVotesCount } }
    );
    
    console.log(`📊 Updated project vote count to: ${remainingVotesCount}`);
    
    // Generate fraud report
    const fraudReport = {
      timestamp: new Date().toISOString(),
      projectId: PROJECT_ID,
      fraudulentVotesRemoved: voteDeleteResult.deletedCount,
      associatedOTPsRemoved: otpIds.length,
      suspiciousUserAgents: [...new Set(suspiciousVotes.map(v => v.userAgent))],
      suspiciousIPs: [...new Set(suspiciousVotes.map(v => v.ipAddress))],
      correctedVoteCount: remainingVotesCount,
      removedVoteDetails: suspiciousVotes.map(vote => ({
        id: vote._id,
        ip: vote.ipAddress,
        userAgent: vote.userAgent,
        votedAt: vote.votedAt
      }))
    };
    
    console.log('\n📄 Fraud removal report:');
    console.log(JSON.stringify(fraudReport, null, 2));
    
    return fraudReport;
    
  } catch (error) {
    console.error('❌ Error removing fraudulent votes:', error);
    throw error;
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Additional security function to detect and block future script attacks
async function implementScriptProtection() {
  console.log('\n🛡️  IMPLEMENTING SCRIPT ATTACK PROTECTION');
  console.log('==========================================');
  
  // This would be implemented in your API middleware
  const protectionCode = `
// middleware/antiBot.js - Add this to your API routes
export function detectBotAttack(userAgent, ip) {
  const suspiciousPatterns = [
    'python-requests',
    'curl/',
    'wget/',
    'node-fetch',
    'axios/',
    'urllib',
    'httpx/',
    'requests/',
    'bot',
    'crawler',
    'spider'
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    userAgent.toLowerCase().includes(pattern.toLowerCase())
  );
  
  if (isSuspicious) {
    console.log(\`🚨 BLOCKED: Suspicious user agent detected: \${userAgent} from IP: \${ip}\`);
    return true;
  }
  
  return false;
}

// Add to your OTP request routes:
if (detectBotAttack(request.headers.get('user-agent'), ipAddress)) {
  return NextResponse.json(
    { error: 'Access denied', message: 'Automated requests not allowed' },
    { status: 403 }
  );
}
`;
  
  console.log('📝 Add this protection code to your API routes:');
  console.log(protectionCode);
}

// Run fraud removal
if (require.main === module) {
  removeFraudulentVotes()
    .then(report => {
      console.log('\n✅ Fraud removal completed successfully');
      implementScriptProtection();
    })
    .catch(error => {
      console.error('❌ Fraud removal failed:', error);
      process.exit(1);
    });
}

module.exports = { removeFraudulentVotes, SUSPICIOUS_USER_AGENTS };