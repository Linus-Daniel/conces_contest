const mongoose = require('mongoose');
const crypto = require('crypto');

// Decryption function
function decrypt(encryptedText) {
  try {
    if (!encryptedText || typeof encryptedText !== 'string') {
      return null;
    }

    const algorithm = "aes-256-gcm";
    const keyString = process.env.ENCRYPTION_KEY || "your-32-char-secret-key-here123";
    const key = crypto.createHash("sha256").update(keyString).digest();

    const parts = encryptedText.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted text format");
    }

    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption failed for:", encryptedText?.substring(0, 20) + "...");
    return null;
  }
}

// Disposable email domains
const disposableDomains = [
  '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'tempmail.org',
  'yopmail.com', 'throwaway.email', 'temp-mail.org', 'sharklasers.com',
  'guerrillamailblock.com', 'pokemail.net', 'spam4.me', 'grr.la',
  'getairmail.com', 'fakeinbox.com', 'throwawaymail.com', 'maildrop.cc',
  'trashmail.com', 'emailondeck.com', 'receivemail.org', 'tempinbox.com',
  'getnada.com', 'mohmal.com', 'meltmail.com', 'mintemail.com',
  'mytrashmail.com', 'mailcatch.com', 'mailexpire.com', 'mailforspam.com',
  'emailmask.me', 'temporarymail.net', 'discard.email', 'tempail.com',
  'gmial.com', 'gmali.com', 'gmai.com', 'yahooo.com', 'yaho.com'
];

function isDisposableEmail(email) {
  if (!email) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return domain && disposableDomains.includes(domain);
}

async function analyzeProjectVotes(projectId) {
  const startTime = new Date();
  console.log(`🔍 Starting analysis for project: ${projectId}`);
  console.log('Start time:', startTime.toISOString());

  try {
    // Connect to database
    const MONGODB_URI = process.env.MONGO_URI;
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const db = mongoose.connection.db;
    
    // Get project information
    const project = await db.collection('projects').findOne({
      _id: new mongoose.Types.ObjectId(projectId)
    });
    
    if (!project) {
      console.error('❌ Project not found');
      return;
    }
    
    console.log(`📊 Project: ${project.projectTitle}`);
    console.log(`👤 Candidate: ${project.candidate?.fullName || 'Unknown'}`);
    console.log(`🗳️ Current Votes: ${project.vote || 0}`);

    // Get all votes for this specific project
    console.log('\n📥 Fetching votes for this project...');
    const projectVotes = await db.collection('votes').find({
      projectId: projectId,
      voterEmail: { $exists: true, $ne: null }
    }).toArray();
    
    console.log(`📊 Found ${projectVotes.length} votes with email addresses for this project`);
    
    if (projectVotes.length === 0) {
      console.log('ℹ️ No email votes found for this project');
      await mongoose.disconnect();
      return;
    }

    // Decrypt and analyze emails
    const analysis = {
      projectId,
      projectTitle: project.projectTitle,
      candidateName: project.candidate?.fullName || 'Unknown',
      totalVotes: projectVotes.length,
      duplicateEmails: {},
      disposableEmails: [],
      suspiciousPatterns: [],
      decryptionErrors: 0,
      uniqueEmails: new Set(),
      emailDomains: {}
    };
    
    const emailCounts = {};
    const processedVotes = [];
    
    console.log('🔓 Decrypting and analyzing emails...');
    
    for (let i = 0; i < projectVotes.length; i++) {
      const vote = projectVotes[i];
      const decryptedEmail = decrypt(vote.voterEmail);
      
      if (!decryptedEmail) {
        analysis.decryptionErrors++;
        continue;
      }
      
      const normalizedEmail = decryptedEmail.toLowerCase().trim();
      const domain = normalizedEmail.split('@')[1];
      
      // Count email occurrences
      emailCounts[normalizedEmail] = (emailCounts[normalizedEmail] || 0) + 1;
      analysis.uniqueEmails.add(normalizedEmail);
      
      // Count domains
      if (domain) {
        analysis.emailDomains[domain] = (analysis.emailDomains[domain] || 0) + 1;
      }
      
      const voteAnalysis = {
        voteId: vote._id,
        email: normalizedEmail,
        domain: domain,
        projectId: vote.projectId,
        ipAddress: vote.ipAddress,
        userAgent: vote.userAgent,
        votedAt: vote.votedAt,
        isDisposable: isDisposableEmail(normalizedEmail),
        suspiciousPatterns: []
      };
      
      // Check for suspicious patterns
      if (isDisposableEmail(normalizedEmail)) {
        voteAnalysis.suspiciousPatterns.push('DISPOSABLE_EMAIL');
        analysis.disposableEmails.push(voteAnalysis);
      }
      
      if (normalizedEmail.includes('+') && normalizedEmail.includes('test')) {
        voteAnalysis.suspiciousPatterns.push('TEST_EMAIL_ALIAS');
      }
      
      if (/\d{3,}/.test(normalizedEmail.split('@')[0])) {
        voteAnalysis.suspiciousPatterns.push('SEQUENTIAL_NUMBERS');
      }
      
      if (voteAnalysis.suspiciousPatterns.length > 0) {
        analysis.suspiciousPatterns.push(voteAnalysis);
      }
      
      processedVotes.push(voteAnalysis);
    }
    
    // Find duplicate emails
    console.log('🔍 Identifying duplicate emails...');
    for (const [email, count] of Object.entries(emailCounts)) {
      if (count > 1) {
        analysis.duplicateEmails[email] = {
          count,
          votes: processedVotes.filter(v => v.email === email)
        };
      }
    }
    
    // IP address analysis for this project
    console.log('🌐 Analyzing IP addresses...');
    const ipCounts = {};
    processedVotes.forEach(vote => {
      if (vote.ipAddress && vote.ipAddress !== 'unknown') {
        ipCounts[vote.ipAddress] = (ipCounts[vote.ipAddress] || 0) + 1;
      }
    });
    
    const suspiciousIPs = Object.entries(ipCounts)
      .filter(([ip, count]) => count > 5) // More than 5 votes from same IP for this project
      .map(([ip, count]) => ({
        ip,
        count,
        votes: processedVotes.filter(v => v.ipAddress === ip)
      }));
    
    analysis.suspiciousIPs = suspiciousIPs;
    
    const endTime = new Date();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n📊 PROJECT-SPECIFIC ANALYSIS RESULTS:');
    console.log('═══════════════════════════════════════');
    console.log(`🎯 Project: ${analysis.projectTitle}`);
    console.log(`👤 Candidate: ${analysis.candidateName}`);
    console.log(`📊 Total Email Votes: ${analysis.totalVotes}`);
    console.log(`📧 Unique Emails: ${analysis.uniqueEmails.size}`);
    console.log(`🔄 Duplicate Emails: ${Object.keys(analysis.duplicateEmails).length}`);
    console.log(`🗑️ Disposable Emails: ${analysis.disposableEmails.length}`);
    console.log(`🚨 Suspicious Patterns: ${analysis.suspiciousPatterns.length}`);
    console.log(`🌐 Suspicious IPs (>5 votes): ${analysis.suspiciousIPs.length}`);
    console.log(`❌ Decryption Errors: ${analysis.decryptionErrors}`);
    console.log(`⏱️ Analysis Duration: ${duration} seconds`);
    console.log('═══════════════════════════════════════');

    // Show duplicate details
    if (Object.keys(analysis.duplicateEmails).length > 0) {
      console.log('\n🔄 DUPLICATE EMAIL DETAILS:');
      Object.entries(analysis.duplicateEmails).forEach(([email, data]) => {
        console.log(`  📧 ${email}: ${data.count} votes`);
        data.votes.forEach(vote => {
          console.log(`    - Vote ID: ${vote.voteId} | IP: ${vote.ipAddress} | Date: ${new Date(vote.votedAt).toLocaleString()}`);
        });
      });
    }

    // Show disposable email details
    if (analysis.disposableEmails.length > 0) {
      console.log('\n🗑️ DISPOSABLE EMAIL DETAILS:');
      const domainCounts = {};
      analysis.disposableEmails.forEach(vote => {
        domainCounts[vote.domain] = (domainCounts[vote.domain] || 0) + 1;
      });
      
      console.log('  Top disposable domains:');
      Object.entries(domainCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([domain, count]) => {
          console.log(`    - ${domain}: ${count} votes`);
        });
    }

    // Show suspicious IPs
    if (analysis.suspiciousIPs.length > 0) {
      console.log('\n🌐 SUSPICIOUS IP ADDRESSES:');
      analysis.suspiciousIPs.forEach(ip => {
        console.log(`  🔍 IP ${ip.ip}: ${ip.count} votes`);
        console.log(`    Unique emails: ${new Set(ip.votes.map(v => v.email)).size}`);
      });
    }

    // Save detailed analysis
    const fs = require('fs');
    const reportData = {
      ...analysis,
      uniqueEmails: Array.from(analysis.uniqueEmails), // Convert Set to Array for JSON
      analysisTimestamp: endTime.toISOString(),
      analysisDuration: duration
    };
    
    const filename = `project-${projectId}-vote-analysis.json`;
    fs.writeFileSync(filename, JSON.stringify(reportData, null, 2));
    console.log(`\n📁 Detailed analysis saved to: ${filename}`);
    
    await mongoose.disconnect();
    return analysis;

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

// Run analysis if called directly
if (require.main === module) {
  const projectId = process.argv[2] || "68e59b2a703c2310cf863da7";
  
  analyzeProjectVotes(projectId)
    .then(analysis => {
      console.log('\n✅ Project analysis completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Project analysis failed:', error.message);
      process.exit(1);
    });
}

module.exports = { analyzeProjectVotes };