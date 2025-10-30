const mongoose = require('mongoose');
const crypto = require('crypto');
const fs = require('fs');

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

// Disposable email domains (expanded list)
const disposableDomains = [
  '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'tempmail.org',
  'yopmail.com', 'throwaway.email', 'temp-mail.org', 'sharklasers.com',
  'guerrillamailblock.com', 'pokemail.net', 'spam4.me', 'grr.la',
  'getairmail.com', 'fakeinbox.com', 'throwawaymail.com', 'maildrop.cc',
  'trashmail.com', 'emailondeck.com', 'receivemail.org', 'tempinbox.com',
  'getnada.com', 'mohmal.com', 'meltmail.com', 'mintemail.com',
  'mytrashmail.com', 'mailcatch.com', 'mailexpire.com', 'mailforspam.com',
  'emailmask.me', 'temporarymail.net', 'discard.email', 'tempail.com',
  'gmial.com', 'gmali.com', 'gmai.com', 'yahooo.com', 'yaho.com',
  'hotmial.com', 'outlok.com', 'gmailcom.com', 'yahoo.co'
];

function isDisposableEmail(email) {
  if (!email) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return domain && disposableDomains.includes(domain);
}

async function cleanupFraudulentVotes() {
  const startTime = new Date();
  console.log('🧹 Starting fraudulent vote cleanup...');
  console.log('Start time:', startTime.toISOString());

  try {
    // Connect to database
    const MONGODB_URI = process.env.MONGO_URI;
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const db = mongoose.connection.db;
    
    // Step 1: Get current stats before cleanup
    console.log('\n📊 Getting initial statistics...');
    const initialVoteCount = await db.collection('votes').countDocuments();
    const initialOtpCount = await db.collection('otps').countDocuments();
    
    console.log(`Initial vote count: ${initialVoteCount.toLocaleString()}`);
    console.log(`Initial OTP count: ${initialOtpCount.toLocaleString()}`);

    // Step 2: Get all votes with email addresses
    console.log('\n🔍 Fetching votes with email addresses...');
    const votesWithEmail = await db.collection('votes').find({
      voterEmail: { $exists: true, $ne: null }
    }).toArray();
    
    console.log(`Found ${votesWithEmail.length.toLocaleString()} votes with emails`);

    // Step 3: Identify fraudulent votes
    console.log('\n🕵️ Identifying fraudulent votes...');
    const fraudulentVotes = [];
    const projectVoteReductions = {};
    
    for (let i = 0; i < votesWithEmail.length; i++) {
      if (i % 1000 === 0) {
        console.log(`Progress: ${i}/${votesWithEmail.length} votes checked`);
      }
      
      const vote = votesWithEmail[i];
      const decryptedEmail = decrypt(vote.voterEmail);
      
      if (decryptedEmail && isDisposableEmail(decryptedEmail)) {
        fraudulentVotes.push({
          ...vote,
          decryptedEmail: decryptedEmail
        });
        
        // Track vote reductions per project
        const projectId = vote.projectId;
        projectVoteReductions[projectId] = (projectVoteReductions[projectId] || 0) + 1;
      }
    }

    console.log(`\n🚨 Found ${fraudulentVotes.length.toLocaleString()} fraudulent votes`);
    console.log(`📊 Affected projects: ${Object.keys(projectVoteReductions).length}`);
    
    // Show breakdown by project
    console.log('\n📋 Fraudulent votes per project:');
    const sortedProjects = Object.entries(projectVoteReductions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    sortedProjects.forEach(([projectId, count]) => {
      console.log(`  Project ${projectId}: ${count} fraudulent votes`);
    });

    if (fraudulentVotes.length === 0) {
      console.log('✅ No fraudulent votes found. Cleanup complete.');
      await mongoose.disconnect();
      return;
    }

    // Step 4: Create backup of what we're about to delete
    console.log('\n💾 Creating backup of fraudulent votes...');
    const backupData = {
      timestamp: new Date().toISOString(),
      totalFraudulentVotes: fraudulentVotes.length,
      projectReductions: projectVoteReductions,
      deletedVotes: fraudulentVotes.map(vote => ({
        voteId: vote._id,
        email: vote.decryptedEmail,
        projectId: vote.projectId,
        votedAt: vote.votedAt,
        ipAddress: vote.ipAddress,
        userAgent: vote.userAgent
      }))
    };
    
    fs.writeFileSync('fraudulent-votes-backup.json', JSON.stringify(backupData, null, 2));
    console.log('✅ Backup saved to fraudulent-votes-backup.json');

    // Step 5: Confirm deletion (in production, you'd want user confirmation)
    console.log('\n⚠️  READY TO DELETE FRAUDULENT VOTES');
    console.log(`About to delete ${fraudulentVotes.length.toLocaleString()} vote records`);
    console.log(`About to update ${Object.keys(projectVoteReductions).length} project vote counts`);
    
    // Step 6: Delete fraudulent vote documents
    console.log('\n🗑️  Deleting fraudulent vote documents...');
    const voteIds = fraudulentVotes.map(vote => vote._id);
    const deleteResult = await db.collection('votes').deleteMany({
      _id: { $in: voteIds }
    });
    
    console.log(`✅ Deleted ${deleteResult.deletedCount.toLocaleString()} vote documents`);

    // Step 7: Update project vote counts
    console.log('\n📊 Updating project vote counts...');
    const projectUpdateResults = [];
    
    for (const [projectId, reduction] of Object.entries(projectVoteReductions)) {
      try {
        const updateResult = await db.collection('projects').updateOne(
          { _id: new mongoose.Types.ObjectId(projectId) },
          { $inc: { vote: -reduction } }
        );
        
        if (updateResult.modifiedCount > 0) {
          projectUpdateResults.push({
            projectId,
            voteReduction: reduction,
            updated: true
          });
        } else {
          console.warn(`⚠️  Failed to update project ${projectId}`);
          projectUpdateResults.push({
            projectId,
            voteReduction: reduction,
            updated: false
          });
        }
      } catch (error) {
        console.error(`❌ Error updating project ${projectId}:`, error.message);
        projectUpdateResults.push({
          projectId,
          voteReduction: reduction,
          updated: false,
          error: error.message
        });
      }
    }
    
    const successfulUpdates = projectUpdateResults.filter(r => r.updated).length;
    console.log(`✅ Successfully updated ${successfulUpdates}/${Object.keys(projectVoteReductions).length} projects`);

    // Step 8: Clean up corresponding OTPs
    console.log('\n🔑 Cleaning up corresponding OTP records...');
    const otpIds = fraudulentVotes
      .filter(vote => vote.otpId)
      .map(vote => vote.otpId);
    
    if (otpIds.length > 0) {
      try {
        // Convert string IDs to ObjectIds
        const objectIds = otpIds.map(id => {
          try {
            return new mongoose.Types.ObjectId(id);
          } catch (error) {
            console.warn(`Invalid OTP ID format: ${id}`);
            return null;
          }
        }).filter(id => id !== null);
        
        if (objectIds.length > 0) {
          const otpDeleteResult = await db.collection('otps').deleteMany({
            _id: { $in: objectIds }
          });
          console.log(`✅ Deleted ${otpDeleteResult.deletedCount.toLocaleString()} OTP records`);
        } else {
          console.log('⚠️  No valid OTP IDs found for deletion');
        }
      } catch (error) {
        console.error('❌ Error deleting OTPs:', error.message);
      }
    } else {
      console.log('ℹ️  No OTP records to clean up');
    }

    // Step 9: Get final statistics
    console.log('\n📊 Getting final statistics...');
    const finalVoteCount = await db.collection('votes').countDocuments();
    const finalOtpCount = await db.collection('otps').countDocuments();
    
    const endTime = new Date();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Step 10: Generate cleanup report
    const cleanupReport = {
      timestamp: endTime.toISOString(),
      duration: `${duration} seconds`,
      statistics: {
        initial: {
          votes: initialVoteCount,
          otps: initialOtpCount
        },
        final: {
          votes: finalVoteCount,
          otps: finalOtpCount
        },
        removed: {
          votes: initialVoteCount - finalVoteCount,
          otps: initialOtpCount - finalOtpCount
        }
      },
      fraudulentVotes: {
        total: fraudulentVotes.length,
        byDomain: fraudulentVotes.reduce((acc, vote) => {
          const domain = vote.decryptedEmail.split('@')[1];
          acc[domain] = (acc[domain] || 0) + 1;
          return acc;
        }, {})
      },
      projectUpdates: projectUpdateResults,
      affectedProjects: Object.keys(projectVoteReductions).length
    };

    // Save cleanup report
    fs.writeFileSync('cleanup-report.json', JSON.stringify(cleanupReport, null, 2));

    console.log('\n🎉 CLEANUP COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════');
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`🗑️  Votes removed: ${(initialVoteCount - finalVoteCount).toLocaleString()}`);
    console.log(`🔑 OTPs removed: ${(initialOtpCount - finalOtpCount).toLocaleString()}`);
    console.log(`📊 Projects updated: ${successfulUpdates}`);
    console.log(`📁 Reports saved: cleanup-report.json, fraudulent-votes-backup.json`);
    console.log('═══════════════════════════════════');

    await mongoose.disconnect();
    return cleanupReport;

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

// Run cleanup if called directly
if (require.main === module) {
  cleanupFraudulentVotes()
    .then(report => {
      console.log('\n✅ Cleanup script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Cleanup script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { cleanupFraudulentVotes };