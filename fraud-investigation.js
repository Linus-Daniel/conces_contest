// fraud-investigation.js - Comprehensive fraud detection and analysis tool
const { MongoClient } = require('mongodb');
const crypto = require('crypto');
const fs = require('fs');

// Configuration
const MONGO_URI =
  "mongodb+srv://ld604068:zfyOhBow2nmL1L8Z@cluster0.wipjjmc.mongodb.net/conces";

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
    return null;
  }
}

// Suspicious patterns detection
const SUSPICIOUS_USER_AGENTS = [
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
  'spider',
  'scrapy',
  'selenium',
  'phantomjs',
  'headless'
];

const DISPOSABLE_EMAIL_DOMAINS = [
  'guerrillamailblock.com',
  'guerrillamail.com',
  'mailinator.com',
  'tempmail.org',
  '10minutemail.com',
  'throwaway.email',
  'maildrop.cc',
  'yopmail.com'
];

// Fraud detection functions
function isSuspiciousUserAgent(userAgent) {
  if (!userAgent) return true;
  return SUSPICIOUS_USER_AGENTS.some(pattern => 
    userAgent.toLowerCase().includes(pattern.toLowerCase())
  );
}

function isDisposableEmail(email) {
  if (!email) return false;
  const domain = email.toLowerCase().split('@')[1];
  return DISPOSABLE_EMAIL_DOMAINS.includes(domain);
}

function detectSequentialPhones(phones) {
  const numbers = phones.map(p => parseInt(p.replace(/\D/g, ''))).filter(n => !isNaN(n));
  const sequential = [];
  
  for (let i = 0; i < numbers.length - 1; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      const diff = Math.abs(numbers[i] - numbers[j]);
      if (diff < 1000 && diff > 0) {
        sequential.push({ phone1: phones[i], phone2: phones[j], difference: diff });
      }
    }
  }
  
  return sequential;
}

function detectRapidVoting(votes) {
  const rapid = [];
  votes.sort((a, b) => new Date(a.votedAt) - new Date(b.votedAt));
  
  for (let i = 0; i < votes.length - 1; i++) {
    const timeDiff = new Date(votes[i + 1].votedAt) - new Date(votes[i].votedAt);
    const minutesDiff = timeDiff / (1000 * 60);
    
    if (minutesDiff < 5) { // Less than 5 minutes apart
      rapid.push({
        vote1: votes[i],
        vote2: votes[i + 1],
        minutesDiff: minutesDiff.toFixed(2)
      });
    }
  }
  
  return rapid;
}

async function investigateFraud() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    console.log('🔍 COMPREHENSIVE FRAUD INVESTIGATION');
    console.log('====================================\n');
    
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db();
    const votesCollection = db.collection('votes');
    const otpsCollection = db.collection('otps');
    const projectsCollection = db.collection('projects');
    
    // Get all projects for candidate mapping
    const projects = await projectsCollection.find({}).toArray();
    console.log(`📊 Found ${projects.length} projects/candidates\n`);
    
    // Get all votes
    const votes = await votesCollection.find({}).toArray();
    console.log(`🗳️  Found ${votes.length} total votes`);
    
    // Get all OTPs
    const otps = await otpsCollection.find({}).toArray();
    console.log(`📱 Found ${otps.length} total OTPs\n`);
    
    // Decrypt all data
    console.log('🔓 Decrypting voter data...');
    const decryptedVotes = votes.map(vote => ({
      ...vote,
      decryptedPhone: decrypt(vote.phoneNumber),
      decryptedEmail: vote.voterEmail ? decrypt(vote.voterEmail) : null
    }));
    
    const decryptedOTPs = otps.map(otp => ({
      ...otp,
      // OTP phone numbers are stored in plain text, emails might be encrypted
      decryptedEmail: otp.email && otp.email.includes(':') ? decrypt(otp.email) : otp.email
    }));
    
    console.log('✅ Data decryption completed\n');
    
    // Fraud analysis by candidate/project
    const fraudAnalysis = {};
    
    for (const project of projects) {
      const projectId = project._id.toString();
      const projectVotes = decryptedVotes.filter(v => v.projectId === projectId);
      const projectOTPs = decryptedOTPs.filter(o => o.projectId === projectId);
      
      console.log(`\n🏆 ANALYZING: ${project.projectTitle || project.candidateName || projectId}`);
      console.log('=' .repeat(50));
      
      // Suspicious votes analysis
      const suspiciousVotes = projectVotes.filter(vote => 
        isSuspiciousUserAgent(vote.userAgent)
      );
      
      const disposableEmailVotes = projectVotes.filter(vote => 
        vote.decryptedEmail && isDisposableEmail(vote.decryptedEmail)
      );
      
      // IP analysis
      const ipCounts = {};
      projectVotes.forEach(vote => {
        ipCounts[vote.ipAddress] = (ipCounts[vote.ipAddress] || 0) + 1;
      });
      
      const suspiciousIPs = Object.entries(ipCounts)
        .filter(([ip, count]) => count > 1)
        .map(([ip, count]) => ({ ip, count }));
      
      // Phone number analysis
      const phones = projectVotes.map(v => v.decryptedPhone).filter(Boolean);
      const sequentialPhones = detectSequentialPhones(phones);
      
      // Rapid voting analysis
      const rapidVoting = detectRapidVoting(projectVotes);
      
      // OTP abuse analysis
      const otpAbuse = {};
      projectOTPs.forEach(otp => {
        const key = otp.phoneNumber || otp.decryptedEmail;
        if (key) {
          otpAbuse[key] = (otpAbuse[key] || 0) + 1;
        }
      });
      
      const multipleOTPs = Object.entries(otpAbuse)
        .filter(([contact, count]) => count > 1)
        .map(([contact, count]) => ({ contact, count }));
      
      // Fraud score calculation
      let fraudScore = 0;
      fraudScore += suspiciousVotes.length * 10; // High weight for bot votes
      fraudScore += disposableEmailVotes.length * 8; // High weight for disposable emails
      fraudScore += suspiciousIPs.reduce((sum, item) => sum + (item.count - 1) * 5, 0);
      fraudScore += sequentialPhones.length * 7;
      fraudScore += rapidVoting.length * 6;
      fraudScore += multipleOTPs.reduce((sum, item) => sum + (item.count - 1) * 3, 0);
      
      const analysis = {
        projectId,
        projectTitle: project.projectTitle || project.candidateName || 'Unknown',
        totalVotes: projectVotes.length,
        totalOTPs: projectOTPs.length,
        fraudScore,
        fraudLevel: fraudScore > 50 ? 'HIGH' : fraudScore > 20 ? 'MEDIUM' : fraudScore > 5 ? 'LOW' : 'CLEAN',
        
        suspiciousActivities: {
          botVotes: {
            count: suspiciousVotes.length,
            details: suspiciousVotes.map(v => ({
              id: v._id,
              userAgent: v.userAgent,
              ip: v.ipAddress,
              phone: v.decryptedPhone,
              votedAt: v.votedAt
            }))
          },
          
          disposableEmails: {
            count: disposableEmailVotes.length,
            details: disposableEmailVotes.map(v => ({
              id: v._id,
              email: v.decryptedEmail,
              phone: v.decryptedPhone,
              ip: v.ipAddress,
              votedAt: v.votedAt
            }))
          },
          
          multipleVotesPerIP: {
            count: suspiciousIPs.length,
            details: suspiciousIPs
          },
          
          sequentialPhoneNumbers: {
            count: sequentialPhones.length,
            details: sequentialPhones
          },
          
          rapidVoting: {
            count: rapidVoting.length,
            details: rapidVoting
          },
          
          multipleOTPs: {
            count: multipleOTPs.length,
            details: multipleOTPs
          }
        },
        
        decryptedVotes: projectVotes.map(v => ({
          id: v._id,
          phone: v.decryptedPhone,
          email: v.decryptedEmail,
          ip: v.ipAddress,
          userAgent: v.userAgent,
          votedAt: v.votedAt,
          otpId: v.otpId
        })),
        
        decryptedOTPs: projectOTPs.map(o => ({
          id: o._id,
          phone: o.phoneNumber,
          email: o.decryptedEmail,
          code: o.code,
          used: o.used,
          attempts: o.attempts,
          createdAt: o.createdAt,
          ipAddress: o.ipAddress,
          userAgent: o.userAgent
        }))
      };
      
      fraudAnalysis[projectId] = analysis;
      
      // Print summary for this candidate
      console.log(`📊 Total Votes: ${analysis.totalVotes}`);
      console.log(`📱 Total OTPs: ${analysis.totalOTPs}`);
      console.log(`🚨 Fraud Score: ${analysis.fraudScore} (${analysis.fraudLevel})`);
      
      if (analysis.suspiciousActivities.botVotes.count > 0) {
        console.log(`🤖 Bot Votes: ${analysis.suspiciousActivities.botVotes.count}`);
      }
      
      if (analysis.suspiciousActivities.disposableEmails.count > 0) {
        console.log(`📧 Disposable Emails: ${analysis.suspiciousActivities.disposableEmails.count}`);
      }
      
      if (analysis.suspiciousActivities.multipleVotesPerIP.count > 0) {
        console.log(`🌐 Suspicious IPs: ${analysis.suspiciousActivities.multipleVotesPerIP.count}`);
      }
      
      if (analysis.suspiciousActivities.sequentialPhoneNumbers.count > 0) {
        console.log(`📞 Sequential Phones: ${analysis.suspiciousActivities.sequentialPhoneNumbers.count}`);
      }
      
      if (analysis.suspiciousActivities.rapidVoting.count > 0) {
        console.log(`⚡ Rapid Voting: ${analysis.suspiciousActivities.rapidVoting.count}`);
      }
    }
    
    // Overall fraud summary
    console.log('\n🚨 OVERALL FRAUD SUMMARY');
    console.log('========================\n');
    
    const sortedByFraud = Object.values(fraudAnalysis)
      .sort((a, b) => b.fraudScore - a.fraudScore);
    
    sortedByFraud.forEach((analysis, index) => {
      const emoji = analysis.fraudLevel === 'HIGH' ? '🔴' : 
                   analysis.fraudLevel === 'MEDIUM' ? '🟡' : 
                   analysis.fraudLevel === 'LOW' ? '🟠' : '🟢';
      
      console.log(`${index + 1}. ${emoji} ${analysis.projectTitle}`);
      console.log(`   Fraud Score: ${analysis.fraudScore} (${analysis.fraudLevel})`);
      console.log(`   Votes: ${analysis.totalVotes} | Bot Votes: ${analysis.suspiciousActivities.botVotes.count}`);
      console.log('');
    });
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalProjects: projects.length,
        totalVotes: votes.length,
        totalOTPs: otps.length,
        highRiskCandidates: sortedByFraud.filter(a => a.fraudLevel === 'HIGH').length,
        mediumRiskCandidates: sortedByFraud.filter(a => a.fraudLevel === 'MEDIUM').length,
        cleanCandidates: sortedByFraud.filter(a => a.fraudLevel === 'CLEAN').length
      },
      candidateAnalysis: fraudAnalysis,
      recommendations: generateRecommendations(fraudAnalysis)
    };
    
    // Save reports
    fs.writeFileSync('fraud-investigation-full-report.json', JSON.stringify(report, null, 2));
    fs.writeFileSync('decrypted-votes-data.json', JSON.stringify(decryptedVotes, null, 2));
    fs.writeFileSync('decrypted-otps-data.json', JSON.stringify(decryptedOTPs, null, 2));
    
    console.log('💾 Reports saved:');
    console.log('   - fraud-investigation-full-report.json');
    console.log('   - decrypted-votes-data.json');
    console.log('   - decrypted-otps-data.json\n');
    
    return report;
    
  } catch (error) {
    console.error('❌ Investigation failed:', error);
    throw error;
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

function generateRecommendations(fraudAnalysis) {
  const recommendations = [];
  
  Object.values(fraudAnalysis).forEach(analysis => {
    if (analysis.fraudLevel === 'HIGH') {
      recommendations.push({
        candidate: analysis.projectTitle,
        priority: 'URGENT',
        actions: [
          'Immediately review all votes for this candidate',
          'Consider disqualifying bot votes',
          'Investigate vote patterns and timing',
          'Manual verification of suspicious votes required'
        ]
      });
    } else if (analysis.fraudLevel === 'MEDIUM') {
      recommendations.push({
        candidate: analysis.projectTitle,
        priority: 'HIGH',
        actions: [
          'Review suspicious voting patterns',
          'Verify voters with disposable emails',
          'Check for coordinated voting attempts'
        ]
      });
    }
  });
  
  return recommendations;
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'investigate') {
    await investigateFraud();
  } else if (command === 'candidate') {
    const candidateId = args[1];
    if (!candidateId) {
      console.log('Usage: node fraud-investigation.js candidate <project-id>');
      return;
    }
    await investigateSpecificCandidate(candidateId);
  } else {
    console.log('🔍 FRAUD INVESTIGATION TOOL');
    console.log('===========================\n');
    console.log('Usage:');
    console.log('  node fraud-investigation.js investigate     # Full investigation');
    console.log('  node fraud-investigation.js candidate <id>  # Specific candidate\n');
    console.log('Environment variables required:');
    console.log('  MONGO_URI     - MongoDB connection string');
    console.log('  ENCRYPTION_KEY  - Decryption key for voter data');
  }
}

async function investigateSpecificCandidate(candidateId) {
  // Implement specific candidate investigation
  console.log(`🔍 Investigating candidate: ${candidateId}`);
  // This would be a focused version of the main investigation
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { investigateFraud, decrypt };