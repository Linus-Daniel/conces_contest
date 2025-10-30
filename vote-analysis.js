const mongoose = require('mongoose');
const crypto = require('crypto');

// Decryption function (matching the encryption from the voting system)
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

// Common disposable email domains
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

// Detect suspicious patterns
function detectSuspiciousPatterns(email, userAgent, ipAddress, votedAt) {
  const patterns = [];
  
  if (!email) return patterns;
  
  // Check for disposable domains
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && disposableDomains.includes(domain)) {
    patterns.push('DISPOSABLE_EMAIL');
  }
  
  // Check for suspicious email patterns
  if (email.includes('+') && email.includes('test')) {
    patterns.push('TEST_EMAIL_ALIAS');
  }
  
  // Check for sequential patterns
  if (/\d{3,}/.test(email.split('@')[0])) {
    patterns.push('SEQUENTIAL_NUMBERS');
  }
  
  // Check for bot-like user agents
  if (userAgent && (
    userAgent.includes('bot') ||
    userAgent.includes('crawler') ||
    userAgent.includes('spider') ||
    userAgent.length < 20
  )) {
    patterns.push('BOT_USER_AGENT');
  }
  
  return patterns;
}

async function analyzeVotes() {
  try {
    console.log('🔍 Starting vote analysis...');
    
    // Connect to database
    const MONGODB_URI = process.env.MONGO_URI;
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const db = mongoose.connection.db;
    
    // Get all votes with email addresses
    console.log('📥 Fetching votes with email addresses...');
    const votes = await db.collection('votes').find({
      voterEmail: { $exists: true, $ne: null }
    }).toArray();
    
    console.log(`📊 Found ${votes.length} votes with email addresses`);
    
    // Decrypt emails and analyze
    const analysis = {
      totalVotes: votes.length,
      duplicateEmails: {},
      disposableEmails: [],
      suspiciousPatterns: [],
      botActivity: [],
      decryptionErrors: 0
    };
    
    const emailCounts = {};
    const processedVotes = [];
    
    console.log('🔓 Decrypting and analyzing emails...');
    
    for (let i = 0; i < votes.length; i++) {
      if (i % 1000 === 0) {
        console.log(`Progress: ${i}/${votes.length} votes processed`);
      }
      
      const vote = votes[i];
      const decryptedEmail = decrypt(vote.voterEmail);
      
      if (!decryptedEmail) {
        analysis.decryptionErrors++;
        continue;
      }
      
      const normalizedEmail = decryptedEmail.toLowerCase().trim();
      
      // Count email occurrences
      emailCounts[normalizedEmail] = (emailCounts[normalizedEmail] || 0) + 1;
      
      // Detect suspicious patterns
      const patterns = detectSuspiciousPatterns(
        normalizedEmail,
        vote.userAgent,
        vote.ipAddress,
        vote.votedAt
      );
      
      const voteAnalysis = {
        voteId: vote._id,
        email: normalizedEmail,
        domain: normalizedEmail.split('@')[1],
        projectId: vote.projectId,
        ipAddress: vote.ipAddress,
        userAgent: vote.userAgent,
        votedAt: vote.votedAt,
        suspiciousPatterns: patterns
      };
      
      processedVotes.push(voteAnalysis);
      
      // Categorize suspicious activity
      if (patterns.length > 0) {
        analysis.suspiciousPatterns.push(voteAnalysis);
      }
      
      if (patterns.includes('DISPOSABLE_EMAIL')) {
        analysis.disposableEmails.push(voteAnalysis);
      }
      
      if (patterns.includes('BOT_USER_AGENT')) {
        analysis.botActivity.push(voteAnalysis);
      }
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
    
    // IP address analysis
    console.log('🌐 Analyzing IP addresses...');
    const ipCounts = {};
    processedVotes.forEach(vote => {
      if (vote.ipAddress && vote.ipAddress !== 'unknown') {
        ipCounts[vote.ipAddress] = (ipCounts[vote.ipAddress] || 0) + 1;
      }
    });
    
    const suspiciousIPs = Object.entries(ipCounts)
      .filter(([ip, count]) => count > 10)
      .map(([ip, count]) => ({
        ip,
        count,
        votes: processedVotes.filter(v => v.ipAddress === ip)
      }));
    
    analysis.suspiciousIPs = suspiciousIPs;
    
    // Domain analysis
    console.log('🏷️ Analyzing email domains...');
    const domainCounts = {};
    processedVotes.forEach(vote => {
      if (vote.domain) {
        domainCounts[vote.domain] = (domainCounts[vote.domain] || 0) + 1;
      }
    });
    
    const topDomains = Object.entries(domainCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20);
    
    analysis.topDomains = topDomains;
    
    await mongoose.disconnect();
    console.log('✅ Analysis complete, generating report...');
    
    return analysis;
    
  } catch (error) {
    console.error('❌ Analysis error:', error.message);
    throw error;
  }
}

// Run analysis if called directly
if (require.main === module) {
  analyzeVotes()
    .then(analysis => {
      console.log('\n📊 ANALYSIS SUMMARY:');
      console.log(`Total votes analyzed: ${analysis.totalVotes}`);
      console.log(`Duplicate emails found: ${Object.keys(analysis.duplicateEmails).length}`);
      console.log(`Disposable emails: ${analysis.disposableEmails.length}`);
      console.log(`Suspicious patterns: ${analysis.suspiciousPatterns.length}`);
      console.log(`Bot activity detected: ${analysis.botActivity.length}`);
      console.log(`Decryption errors: ${analysis.decryptionErrors}`);
      console.log(`Suspicious IPs (>10 votes): ${analysis.suspiciousIPs.length}`);
      
      // Save detailed results to file for report generation
      const fs = require('fs');
      fs.writeFileSync('vote-analysis-results.json', JSON.stringify(analysis, null, 2));
      console.log('📁 Detailed results saved to vote-analysis-results.json');
    })
    .catch(error => {
      console.error('❌ Failed to complete analysis:', error.message);
      process.exit(1);
    });
}

module.exports = { analyzeVotes, decrypt };