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
    return null;
  }
}

// Key disposable domains from our analysis
const disposableDomains = [
  'guerrillamailblock.com', 'tempmail.org', 'yopmail.com', 'mailinator.com',
  '10minutemail.com', 'guerrillamail.com', 'throwaway.email', 'temp-mail.org'
];

async function fastCleanup() {
  console.log('🧹 Starting fast fraudulent vote cleanup...');
  const startTime = new Date();

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Get initial counts
    const initialVotes = await db.collection('votes').countDocuments();
    const initialProjects = await db.collection('projects').find({}).toArray();
    
    console.log(`📊 Initial votes: ${initialVotes.toLocaleString()}`);
    console.log(`📊 Projects count: ${initialProjects.length}`);

    // Process votes in batches and identify fraudulent ones
    console.log('\n🔍 Processing votes in batches...');
    const batchSize = 1000;
    let totalProcessed = 0;
    let fraudulentVoteIds = [];
    let projectReductions = {};
    
    // Get total count for progress tracking
    const totalVotesWithEmail = await db.collection('votes').countDocuments({
      voterEmail: { $exists: true, $ne: null }
    });
    
    console.log(`📧 Total votes with emails: ${totalVotesWithEmail.toLocaleString()}`);

    // Process in batches using cursor
    const cursor = db.collection('votes').find({
      voterEmail: { $exists: true, $ne: null }
    }).batchSize(batchSize);

    while (await cursor.hasNext()) {
      const batch = [];
      for (let i = 0; i < batchSize && await cursor.hasNext(); i++) {
        batch.push(await cursor.next());
      }

      // Process batch
      for (const vote of batch) {
        const decryptedEmail = decrypt(vote.voterEmail);
        if (decryptedEmail) {
          const domain = decryptedEmail.split('@')[1]?.toLowerCase();
          if (domain && disposableDomains.includes(domain)) {
            fraudulentVoteIds.push(vote._id);
            projectReductions[vote.projectId] = (projectReductions[vote.projectId] || 0) + 1;
          }
        }
      }

      totalProcessed += batch.length;
      if (totalProcessed % 5000 === 0) {
        console.log(`Progress: ${totalProcessed.toLocaleString()}/${totalVotesWithEmail.toLocaleString()} processed`);
        console.log(`Found ${fraudulentVoteIds.length.toLocaleString()} fraudulent votes so far`);
      }
    }

    console.log(`\n🚨 Found ${fraudulentVoteIds.length.toLocaleString()} fraudulent votes`);
    console.log(`📊 Affected projects: ${Object.keys(projectReductions).length}`);

    if (fraudulentVoteIds.length === 0) {
      console.log('✅ No fraudulent votes found');
      await mongoose.disconnect();
      return;
    }

    // Show top affected projects
    const topAffected = Object.entries(projectReductions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    console.log('\n📋 Top affected projects:');
    topAffected.forEach(([projectId, count]) => {
      console.log(`  ${projectId}: ${count} fraudulent votes`);
    });

    // Delete fraudulent votes
    console.log('\n🗑️ Deleting fraudulent votes...');
    const deleteResult = await db.collection('votes').deleteMany({
      _id: { $in: fraudulentVoteIds }
    });
    console.log(`✅ Deleted ${deleteResult.deletedCount.toLocaleString()} votes`);

    // Update project vote counts
    console.log('\n📊 Updating project vote counts...');
    let updatedProjects = 0;
    
    for (const [projectId, reduction] of Object.entries(projectReductions)) {
      try {
        const result = await db.collection('projects').updateOne(
          { _id: new mongoose.Types.ObjectId(projectId) },
          { $inc: { vote: -reduction } }
        );
        if (result.modifiedCount > 0) {
          updatedProjects++;
        }
      } catch (error) {
        console.warn(`⚠️ Failed to update project ${projectId}:`, error.message);
      }
    }
    
    console.log(`✅ Updated ${updatedProjects} projects`);

    // Clean up OTPs
    console.log('\n🔑 Cleaning up OTPs...');
    const fraudulentVotes = await db.collection('votes').find({
      _id: { $in: fraudulentVoteIds.slice(0, 100) } // Sample for OTP cleanup
    }).toArray();
    
    const otpIds = fraudulentVotes
      .filter(vote => vote.otpId)
      .map(vote => {
        try {
          return new mongoose.Types.ObjectId(vote.otpId);
        } catch {
          return null;
        }
      })
      .filter(id => id !== null);

    if (otpIds.length > 0) {
      const otpDeleteResult = await db.collection('otps').deleteMany({
        _id: { $in: otpIds }
      });
      console.log(`✅ Deleted ${otpDeleteResult.deletedCount} OTP records`);
    }

    // Final statistics
    const finalVotes = await db.collection('votes').countDocuments();
    const endTime = new Date();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Create summary report
    const summary = {
      timestamp: endTime.toISOString(),
      duration: `${duration} seconds`,
      statistics: {
        initialVotes,
        finalVotes,
        votesRemoved: initialVotes - finalVotes,
        fraudulentVotesFound: fraudulentVoteIds.length
      },
      projectsAffected: Object.keys(projectReductions).length,
      topAffectedProjects: topAffected
    };

    fs.writeFileSync('fraud-cleanup-summary.json', JSON.stringify(summary, null, 2));

    console.log('\n🎉 CLEANUP COMPLETED!');
    console.log('═══════════════════════════════');
    console.log(`⏱️ Duration: ${duration} seconds`);
    console.log(`🗑️ Votes removed: ${(initialVotes - finalVotes).toLocaleString()}`);
    console.log(`📊 Projects updated: ${updatedProjects}`);
    console.log(`📁 Summary saved: fraud-cleanup-summary.json`);
    console.log('═══════════════════════════════');

    await mongoose.disconnect();

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    throw error;
  }
}

if (require.main === module) {
  fastCleanup()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { fastCleanup };