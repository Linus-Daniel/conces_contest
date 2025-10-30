const mongoose = require('mongoose');
const fs = require('fs');

async function quickCleanup() {
  console.log('🧹 Starting quick cleanup using pre-analyzed data...');
  const startTime = new Date();

  try {
    // Load pre-analyzed fraudulent votes
    if (!fs.existsSync('vote-analysis-results.json')) {
      throw new Error('Analysis results not found. Please run vote-analysis.js first.');
    }

    const analysis = JSON.parse(fs.readFileSync('vote-analysis-results.json', 'utf8'));
    console.log(`📊 Loaded analysis with ${analysis.disposableEmails.length} fraudulent votes`);

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Get initial statistics
    const initialVotes = await db.collection('votes').countDocuments();
    console.log(`📊 Initial vote count: ${initialVotes.toLocaleString()}`);

    // Extract vote IDs and project impacts from analysis
    const fraudulentVoteIds = analysis.disposableEmails.map(vote => 
      new mongoose.Types.ObjectId(vote.voteId)
    );
    
    const projectReductions = analysis.disposableEmails.reduce((acc, vote) => {
      acc[vote.projectId] = (acc[vote.projectId] || 0) + 1;
      return acc;
    }, {});

    console.log(`🎯 Target: ${fraudulentVoteIds.length.toLocaleString()} fraudulent votes`);
    console.log(`📊 Affected projects: ${Object.keys(projectReductions).length}`);

    // Show project impact breakdown
    const topAffected = Object.entries(projectReductions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    console.log('\n📋 Top affected projects:');
    topAffected.forEach(([projectId, count]) => {
      console.log(`  ${projectId}: ${count} fraudulent votes to remove`);
    });

    // Step 1: Delete fraudulent vote documents
    console.log('\n🗑️ Deleting fraudulent vote documents...');
    const deleteResult = await db.collection('votes').deleteMany({
      _id: { $in: fraudulentVoteIds }
    });
    
    console.log(`✅ Deleted ${deleteResult.deletedCount.toLocaleString()} vote documents`);

    // Step 2: Update project vote counts
    console.log('\n📊 Updating project vote counts...');
    const updateResults = [];
    
    for (const [projectId, reduction] of Object.entries(projectReductions)) {
      try {
        const updateResult = await db.collection('projects').updateOne(
          { _id: new mongoose.Types.ObjectId(projectId) },
          { $inc: { vote: -reduction } }
        );
        
        updateResults.push({
          projectId,
          reduction,
          success: updateResult.modifiedCount > 0
        });
        
        if (updateResult.modifiedCount > 0) {
          console.log(`  ✅ Project ${projectId}: reduced by ${reduction} votes`);
        } else {
          console.log(`  ⚠️ Project ${projectId}: update failed`);
        }
      } catch (error) {
        console.error(`  ❌ Project ${projectId}: ${error.message}`);
        updateResults.push({
          projectId,
          reduction,
          success: false,
          error: error.message
        });
      }
    }

    const successfulUpdates = updateResults.filter(r => r.success).length;
    console.log(`\n✅ Successfully updated ${successfulUpdates}/${Object.keys(projectReductions).length} projects`);

    // Step 3: Clean up corresponding OTP records
    console.log('\n🔑 Cleaning up OTP records...');
    const otpIds = analysis.disposableEmails
      .filter(vote => vote.voteId)
      .map(vote => {
        try {
          return new mongoose.Types.ObjectId(vote.voteId);
        } catch {
          return null;
        }
      })
      .filter(id => id !== null);

    // Find OTPs that reference the deleted votes
    const otpsToDelete = await db.collection('otps').find({
      _id: { $in: otpIds }
    }).toArray();

    if (otpsToDelete.length > 0) {
      const otpDeleteResult = await db.collection('otps').deleteMany({
        _id: { $in: otpsToDelete.map(otp => otp._id) }
      });
      console.log(`✅ Deleted ${otpDeleteResult.deletedCount} OTP records`);
    } else {
      console.log('ℹ️ No OTP records found to delete');
    }

    // Final statistics
    const finalVotes = await db.collection('votes').countDocuments();
    const endTime = new Date();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Generate cleanup report
    const cleanupReport = {
      timestamp: endTime.toISOString(),
      duration: `${duration} seconds`,
      statistics: {
        initialVotes,
        finalVotes,
        votesRemoved: deleteResult.deletedCount,
        targetFraudulentVotes: fraudulentVoteIds.length
      },
      projectUpdates: {
        attempted: Object.keys(projectReductions).length,
        successful: successfulUpdates,
        reductions: projectReductions
      },
      otpCleanup: {
        checked: otpIds.length,
        deleted: otpsToDelete.length
      },
      fraudulentVoteBreakdown: analysis.disposableEmails.reduce((acc, vote) => {
        acc[vote.domain] = (acc[vote.domain] || 0) + 1;
        return acc;
      }, {})
    };

    // Save reports
    fs.writeFileSync('FRAUDULENT_EMAIL_CLEANUP_REPORT.json', JSON.stringify(cleanupReport, null, 2));

    console.log('\n🎉 CLEANUP COMPLETED SUCCESSFULLY!');
    console.log('════════════════════════════════════════');
    console.log(`⏱️ Total duration: ${duration} seconds`);
    console.log(`🗑️ Votes removed: ${deleteResult.deletedCount.toLocaleString()}/${fraudulentVoteIds.length.toLocaleString()}`);
    console.log(`📊 Projects updated: ${successfulUpdates}/${Object.keys(projectReductions).length}`);
    console.log(`🔑 OTPs cleaned: ${otpsToDelete.length}`);
    console.log(`📉 Vote count: ${initialVotes.toLocaleString()} → ${finalVotes.toLocaleString()}`);
    console.log(`📁 Report saved: FRAUDULENT_EMAIL_CLEANUP_REPORT.json`);
    console.log('════════════════════════════════════════');

    await mongoose.disconnect();
    return cleanupReport;

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    throw error;
  }
}

if (require.main === module) {
  quickCleanup()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { quickCleanup };