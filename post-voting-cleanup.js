// post-voting-cleanup.js - Execute after voting period ends to clean fraud
// Usage: node post-voting-cleanup.js [cleanup-type]
// Types: duplicates, fraudulent-emails, all

const { MongoClient } = require('mongodb');
const crypto = require('crypto');
const fs = require('fs');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ld604068:zfyOhBow2nmL1L8Z@cluster0.wipjjmc.mongodb.net/conces';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-char-secret-key-here123';

// Utility Functions
function decrypt(encryptedText) {
  try {
    if (!encryptedText) return null;
    
    const algorithm = 'aes-256-gcm';
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    
    const parts = encryptedText.split(':');
    if (parts.length !== 3) throw new Error('Invalid encrypted format');
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    return null;
  }
}

function generateCleanupReport(type, results) {
  const reportContent = `# Post-Voting Cleanup Report - ${new Date().toISOString()}

## Cleanup Type: ${type.toUpperCase()}

### Summary
- **Votes removed**: ${results.votesRemoved}
- **Projects affected**: ${results.projectsAffected}
- **OTPs cleaned**: ${results.otpsRemoved}
- **Final clean vote count**: ${results.finalVoteCount}

### Detailed Results
${results.details}

### Verification
- **Data integrity**: ${results.integrity}
- **Cleanup successful**: ${results.success}

---
*Cleanup executed post-voting to ensure fair contest results*
`;

  const filename = `/home/lord/contest/CLEANUP_REPORT_${type.toUpperCase()}_${Date.now()}.md`;
  fs.writeFileSync(filename, reportContent);
  return filename;
}

// 1. DUPLICATE VOTE CLEANUP
async function removeDuplicateVotes(db) {
  console.log('🔥 REMOVING DUPLICATE VOTES (Post-Voting Cleanup)');
  console.log('================================================');
  
  // Get all votes sorted by voting time (earliest first)
  const allVotes = await db.collection('votes').find({}).sort({votedAt: 1}).toArray();
  console.log(`Total votes to process: ${allVotes.length}`);
  
  const seenEmails = new Set();
  const seenPhones = new Set();
  const votesToKeep = [];
  const votesToDelete = [];
  
  for (const vote of allVotes) {
    let shouldKeep = true;
    let duplicateReason = '';
    
    // Check email duplicates
    if (vote.voterEmail) {
      const decryptedEmail = decrypt(vote.voterEmail);
      if (decryptedEmail) {
        if (seenEmails.has(decryptedEmail)) {
          shouldKeep = false;
          duplicateReason = `Duplicate email: ${decryptedEmail}`;
        } else {
          seenEmails.add(decryptedEmail);
        }
      }
    }
    
    // Check phone duplicates (only if not already marked for deletion)
    if (shouldKeep && vote.phoneNumber) {
      const decryptedPhone = decrypt(vote.phoneNumber);
      if (decryptedPhone) {
        if (seenPhones.has(decryptedPhone)) {
          shouldKeep = false;
          duplicateReason = `Duplicate phone: ${decryptedPhone}`;
        } else {
          seenPhones.add(decryptedPhone);
        }
      }
    }
    
    if (shouldKeep) {
      votesToKeep.push(vote);
    } else {
      votesToDelete.push({ vote, reason: duplicateReason });
    }
  }
  
  console.log(`Votes to keep: ${votesToKeep.length}`);
  console.log(`Votes to delete: ${votesToDelete.length}`);
  
  // Delete duplicate votes
  if (votesToDelete.length > 0) {
    const voteIdsToDelete = votesToDelete.map(item => item.vote._id);
    const deleteResult = await db.collection('votes').deleteMany({
      _id: { $in: voteIdsToDelete }
    });
    
    console.log(`✅ Deleted ${deleteResult.deletedCount} duplicate votes`);
    
    // Remove associated OTPs
    const otpIdsToDelete = votesToDelete.map(item => item.vote.otpId).filter(Boolean);
    if (otpIdsToDelete.length > 0) {
      const otpDeleteResult = await db.collection('otps').deleteMany({
        _id: { $in: otpIdsToDelete }
      });
      console.log(`✅ Removed ${otpDeleteResult.deletedCount} associated OTPs`);
    }
    
    return {
      votesRemoved: deleteResult.deletedCount,
      otpsRemoved: otpIdsToDelete.length,
      duplicateDetails: votesToDelete.slice(0, 10) // Sample for report
    };
  }
  
  return { votesRemoved: 0, otpsRemoved: 0, duplicateDetails: [] };
}

// 2. FRAUDULENT EMAIL CLEANUP
async function removeFraudulentEmails(db) {
  console.log('🔥 REMOVING FRAUDULENT EMAIL VOTES (Post-Voting Cleanup)');
  console.log('======================================================');
  
  // Define suspicious domains
  const suspiciousDomains = [
    'guerrillamailblock.com',
    'atomicmail.io', 
    'emmynorbertonschools.com',
    'tiffincrane.com',
    'dayrep.com',
    'einrot.com',
    'simplelogin.com',
    'starr9.com',
    'nicegovmail.com',
    'potatod.com',
    'sspnplus.com',
    'qbuybox.com',
    'armyspy.com',
    'claudd.com',
    'vonsti.com',
    'teleworm.us',
    'jourrapide.com',
    'rhyta.com',
    'fleckens.hu',
    'superrito.com',
    'mailtothis.com',
    'mailinator.com',
    'temp-mail.org',
    'throwaway.email',
    'disposable.email'
  ];
  
  // Get all votes with emails
  const allVotes = await db.collection('votes').find({
    voterEmail: { $exists: true, $ne: null }
  }).toArray();
  
  const fraudulentVotes = [];
  
  for (const vote of allVotes) {
    const decryptedEmail = decrypt(vote.voterEmail);
    if (decryptedEmail && decryptedEmail.includes('@')) {
      const domain = decryptedEmail.split('@')[1].toLowerCase();
      
      if (suspiciousDomains.includes(domain)) {
        fraudulentVotes.push({
          voteId: vote._id,
          email: decryptedEmail,
          domain: domain,
          projectId: vote.projectId,
          otpId: vote.otpId
        });
      }
    }
  }
  
  console.log(`Found ${fraudulentVotes.length} fraudulent votes to remove`);
  
  if (fraudulentVotes.length > 0) {
    // Delete fraudulent votes
    const fraudulentVoteIds = fraudulentVotes.map(v => v.voteId);
    const deleteResult = await db.collection('votes').deleteMany({
      _id: { $in: fraudulentVoteIds }
    });
    
    console.log(`✅ Deleted ${deleteResult.deletedCount} fraudulent votes`);
    
    // Remove associated OTPs
    const otpIdsToDelete = fraudulentVotes.map(v => v.otpId).filter(Boolean);
    if (otpIdsToDelete.length > 0) {
      const otpDeleteResult = await db.collection('otps').deleteMany({
        _id: { $in: otpIdsToDelete }
      });
      console.log(`✅ Removed ${otpDeleteResult.deletedCount} fraudulent OTPs`);
    }
    
    return {
      votesRemoved: deleteResult.deletedCount,
      otpsRemoved: otpIdsToDelete.length,
      fraudulentDetails: fraudulentVotes.slice(0, 10) // Sample for report
    };
  }
  
  return { votesRemoved: 0, otpsRemoved: 0, fraudulentDetails: [] };
}

// 3. UPDATE PROJECT VOTE COUNTS
async function updateProjectVoteCounts(db) {
  console.log('📊 UPDATING PROJECT VOTE COUNTS TO REFLECT CLEAN DATA');
  console.log('===================================================');
  
  const projects = await db.collection('projects').find({}).toArray();
  const updatedProjects = [];
  
  for (const project of projects) {
    const actualVoteCount = await db.collection('votes').countDocuments({
      projectId: project._id.toString()
    });
    
    if (project.vote !== actualVoteCount) {
      await db.collection('projects').updateOne(
        {_id: project._id},
        {$set: {vote: actualVoteCount}}
      );
      
      updatedProjects.push({
        title: project.projectTitle,
        oldCount: project.vote,
        newCount: actualVoteCount,
        difference: project.vote - actualVoteCount
      });
      
      console.log(`Updated ${project.projectTitle}: ${project.vote} → ${actualVoteCount}`);
    }
  }
  
  return {
    projectsUpdated: updatedProjects.length,
    updatedProjects: updatedProjects
  };
}

// 4. MAIN CLEANUP FUNCTIONS
async function cleanupDuplicates() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🎯 EXECUTING DUPLICATE CLEANUP');
    console.log('==============================\n');
    
    const duplicateResults = await removeDuplicateVotes(db);
    const projectResults = await updateProjectVoteCounts(db);
    
    const finalVoteCount = await db.collection('votes').countDocuments();
    const finalOTPCount = await db.collection('otps').countDocuments({used: true, voteConfirmed: true});
    
    const results = {
      votesRemoved: duplicateResults.votesRemoved,
      projectsAffected: projectResults.projectsUpdated,
      otpsRemoved: duplicateResults.otpsRemoved,
      finalVoteCount: finalVoteCount,
      details: `Removed duplicates based on global email/phone uniqueness.\\nSample removed votes: ${JSON.stringify(duplicateResults.duplicateDetails.slice(0, 3), null, 2)}`,
      integrity: Math.abs(finalVoteCount - finalOTPCount) <= 10 ? 'GOOD' : 'NEEDS REVIEW',
      success: true
    };
    
    const reportFile = generateCleanupReport('duplicates', results);
    console.log(`\\n📄 Cleanup report saved: ${reportFile}`);
    
    return results;
    
  } finally {
    await client.close();
  }
}

async function cleanupFraudulentEmails() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🎯 EXECUTING FRAUDULENT EMAIL CLEANUP');
    console.log('====================================\n');
    
    const fraudResults = await removeFraudulentEmails(db);
    const projectResults = await updateProjectVoteCounts(db);
    
    const finalVoteCount = await db.collection('votes').countDocuments();
    const finalOTPCount = await db.collection('otps').countDocuments({used: true, voteConfirmed: true});
    
    const results = {
      votesRemoved: fraudResults.votesRemoved,
      projectsAffected: projectResults.projectsUpdated,
      otpsRemoved: fraudResults.otpsRemoved,
      finalVoteCount: finalVoteCount,
      details: `Removed votes from disposable/temporary email services.\\nSample domains: ${JSON.stringify(fraudResults.fraudulentDetails.slice(0, 3), null, 2)}`,
      integrity: Math.abs(finalVoteCount - finalOTPCount) <= 10 ? 'GOOD' : 'NEEDS REVIEW',
      success: true
    };
    
    const reportFile = generateCleanupReport('fraudulent-emails', results);
    console.log(`\\n📄 Cleanup report saved: ${reportFile}`);
    
    return results;
    
  } finally {
    await client.close();
  }
}

async function cleanupAll() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🎯 EXECUTING COMPLETE CLEANUP (DUPLICATES + FRAUDULENT EMAILS)');
    console.log('=============================================================\n');
    
    // Step 1: Remove fraudulent emails first
    console.log('Step 1: Removing fraudulent emails...');
    const fraudResults = await removeFraudulentEmails(db);
    
    // Step 2: Remove duplicates
    console.log('\\nStep 2: Removing duplicates...');
    const duplicateResults = await removeDuplicateVotes(db);
    
    // Step 3: Update project counts
    console.log('\\nStep 3: Updating project counts...');
    const projectResults = await updateProjectVoteCounts(db);
    
    const finalVoteCount = await db.collection('votes').countDocuments();
    const finalOTPCount = await db.collection('otps').countDocuments({used: true, voteConfirmed: true});
    
    const results = {
      votesRemoved: fraudResults.votesRemoved + duplicateResults.votesRemoved,
      projectsAffected: projectResults.projectsUpdated,
      otpsRemoved: fraudResults.otpsRemoved + duplicateResults.otpsRemoved,
      finalVoteCount: finalVoteCount,
      details: `Complete cleanup executed:\\n- Fraudulent emails: ${fraudResults.votesRemoved}\\n- Duplicates: ${duplicateResults.votesRemoved}\\n- Projects updated: ${projectResults.projectsUpdated}`,
      integrity: Math.abs(finalVoteCount - finalOTPCount) <= 10 ? 'GOOD' : 'NEEDS REVIEW',
      success: true
    };
    
    const reportFile = generateCleanupReport('complete', results);
    console.log(`\\n📄 Complete cleanup report saved: ${reportFile}`);
    
    console.log('\\n🎉 CONTEST CLEANUP COMPLETE!');
    console.log('============================');
    console.log(`✅ Total fraudulent votes removed: ${results.votesRemoved}`);
    console.log(`✅ Final clean vote count: ${results.finalVoteCount}`);
    console.log(`✅ All projects updated with accurate counts`);
    console.log(`✅ Contest results now reflect legitimate votes only!`);
    
    return results;
    
  } finally {
    await client.close();
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const cleanupType = args[0] || 'help';
  
  console.log('🚀 POST-VOTING CLEANUP SYSTEM');
  console.log('==============================');
  console.log('Executing surprise cleanup after voting ends!\\n');
  
  try {
    switch (cleanupType) {
      case 'duplicates':
        await cleanupDuplicates();
        break;
      case 'fraudulent-emails':
        await cleanupFraudulentEmails();
        break;
      case 'all':
        await cleanupAll();
        break;
      case 'help':
      default:
        console.log('Available cleanup options:');
        console.log('  node post-voting-cleanup.js duplicates        # Remove duplicate votes only');
        console.log('  node post-voting-cleanup.js fraudulent-emails # Remove fraudulent email votes only');
        console.log('  node post-voting-cleanup.js all              # Complete cleanup (recommended)');
        console.log('\\nRecommended: Run "all" after voting period ends for complete fraud removal');
        break;
    }
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  cleanupDuplicates,
  cleanupFraudulentEmails,
  cleanupAll,
  removeDuplicateVotes,
  removeFraudulentEmails,
  updateProjectVoteCounts
};