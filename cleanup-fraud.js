// cleanup-fraud.js - Remove fraudulent votes based on investigation results
const { MongoClient } = require('mongodb');
const fs = require('fs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database';

async function cleanupFraudulentVotes(options = {}) {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🧹 FRAUDULENT VOTE CLEANUP');
    console.log('===========================\n');
    
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db();
    const votesCollection = db.collection('votes');
    const otpsCollection = db.collection('otps');
    const projectsCollection = db.collection('projects');
    
    const cleanupResults = {
      timestamp: new Date().toISOString(),
      candidatesAffected: {},
      totalVotesRemoved: 0,
      totalOTPsRemoved: 0,
      cleanupCriteria: []
    };
    
    // Define cleanup criteria
    const cleanupCriteria = [
      {
        name: 'Python Script Votes',
        condition: {
          userAgent: { $regex: /python-requests|curl\/|wget\/|axios\/|bot|crawler/i }
        },
        priority: 'HIGH'
      },
      {
        name: 'Disposable Email Votes',
        condition: {
          // We'll need to decrypt and check emails
        },
        priority: 'HIGH',
        requiresDecryption: true
      },
      {
        name: 'Same IP Multiple Votes',
        condition: {},
        priority: 'MEDIUM',
        requiresAnalysis: true
      }
    ];
    
    // 1. Remove Python script votes (highest priority)
    console.log('🤖 Removing Python script votes...');
    const pythonVotes = await votesCollection.find({
      userAgent: { $regex: /python-requests|curl\/|wget\/|axios\/|httpx\/|urllib|bot|crawler|scrapy/i }
    }).toArray();
    
    if (pythonVotes.length > 0) {
      console.log(`Found ${pythonVotes.length} bot votes to remove`);
      
      // Group by project for vote count adjustment
      const votesByProject = {};
      pythonVotes.forEach(vote => {
        if (!votesByProject[vote.projectId]) {
          votesByProject[vote.projectId] = [];
        }
        votesByProject[vote.projectId].push(vote);
      });
      
      // Remove bot votes
      const botVoteIds = pythonVotes.map(v => v._id);
      const deleteResult = await votesCollection.deleteMany({
        _id: { $in: botVoteIds }
      });
      
      console.log(`✅ Removed ${deleteResult.deletedCount} bot votes`);
      cleanupResults.totalVotesRemoved += deleteResult.deletedCount;
      
      // Remove associated OTPs
      const botOTPIds = pythonVotes.map(v => v.otpId).filter(Boolean);
      if (botOTPIds.length > 0) {
        const otpDeleteResult = await otpsCollection.deleteMany({
          _id: { $in: botOTPIds }
        });
        console.log(`✅ Removed ${otpDeleteResult.deletedCount} associated OTPs`);
        cleanupResults.totalOTPsRemoved += otpDeleteResult.deletedCount;
      }
      
      // Update project vote counts
      for (const [projectId, votes] of Object.entries(votesByProject)) {
        const remainingVotes = await votesCollection.countDocuments({ projectId });
        await projectsCollection.updateOne(
          { _id: projectId },
          { $set: { vote: remainingVotes } }
        );
        
        console.log(`📊 Updated ${projectId}: removed ${votes.length} votes, ${remainingVotes} remaining`);
        
        cleanupResults.candidatesAffected[projectId] = {
          botVotesRemoved: votes.length,
          remainingVotes
        };
      }
    } else {
      console.log('✅ No bot votes found');
    }
    
    // 2. Remove votes from same IP (if more than threshold)
    console.log('\n🌐 Analyzing multiple votes from same IP...');
    const ipAnalysis = await votesCollection.aggregate([
      {
        $group: {
          _id: '$ipAddress',
          votes: { $push: '$$ROOT' },
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]).toArray();
    
    let suspiciousIPVotes = 0;
    for (const ipGroup of ipAnalysis) {
      if (ipGroup.count > 2) { // More than 2 votes from same IP is suspicious
        console.log(`⚠️  IP ${ipGroup._id}: ${ipGroup.count} votes (keeping 1, removing ${ipGroup.count - 1})`);
        
        // Keep the first vote, remove the rest
        const votesToRemove = ipGroup.votes.slice(1);
        const voteIdsToRemove = votesToRemove.map(v => v._id);
        
        const ipDeleteResult = await votesCollection.deleteMany({
          _id: { $in: voteIdsToRemove }
        });
        
        suspiciousIPVotes += ipDeleteResult.deletedCount;
        
        // Update project counts
        const projectUpdates = {};
        votesToRemove.forEach(vote => {
          projectUpdates[vote.projectId] = (projectUpdates[vote.projectId] || 0) + 1;
        });
        
        for (const [projectId, removedCount] of Object.entries(projectUpdates)) {
          const remainingVotes = await votesCollection.countDocuments({ projectId });
          await projectsCollection.updateOne(
            { _id: projectId },
            { $set: { vote: remainingVotes } }
          );
          
          if (!cleanupResults.candidatesAffected[projectId]) {
            cleanupResults.candidatesAffected[projectId] = { remainingVotes };
          }
          cleanupResults.candidatesAffected[projectId].ipDuplicatesRemoved = removedCount;
        }
      }
    }
    
    console.log(`✅ Removed ${suspiciousIPVotes} suspicious IP duplicate votes`);
    cleanupResults.totalVotesRemoved += suspiciousIPVotes;
    
    // 3. Remove old unused OTPs (cleanup)
    console.log('\n📱 Cleaning up old unused OTPs...');
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oldOTPsResult = await otpsCollection.deleteMany({
      $or: [
        { used: false, createdAt: { $lt: oneDayAgo } },
        { used: true, voteConfirmed: false, createdAt: { $lt: oneDayAgo } }
      ]
    });
    
    console.log(`✅ Removed ${oldOTPsResult.deletedCount} old unused OTPs`);
    cleanupResults.totalOTPsRemoved += oldOTPsResult.deletedCount;
    
    // 4. Final vote count verification
    console.log('\n📊 Final vote count verification...');
    const projects = await projectsCollection.find({}).toArray();
    
    for (const project of projects) {
      const actualVoteCount = await votesCollection.countDocuments({ 
        projectId: project._id.toString() 
      });
      
      if (project.vote !== actualVoteCount) {
        console.log(`🔧 Correcting vote count for ${project.projectTitle || project._id}`);
        console.log(`   Database: ${project.vote} → Actual: ${actualVoteCount}`);
        
        await projectsCollection.updateOne(
          { _id: project._id },
          { $set: { vote: actualVoteCount } }
        );
      }
    }
    
    // Generate cleanup report
    console.log('\n📋 CLEANUP SUMMARY');
    console.log('==================');
    console.log(`Total votes removed: ${cleanupResults.totalVotesRemoved}`);
    console.log(`Total OTPs removed: ${cleanupResults.totalOTPsRemoved}`);
    console.log(`Candidates affected: ${Object.keys(cleanupResults.candidatesAffected).length}`);
    
    // Detailed candidate impact
    if (Object.keys(cleanupResults.candidatesAffected).length > 0) {
      console.log('\n🏆 IMPACT BY CANDIDATE:');
      for (const [projectId, impact] of Object.entries(cleanupResults.candidatesAffected)) {
        const project = projects.find(p => p._id.toString() === projectId);
        const projectName = project?.projectTitle || project?.candidateName || projectId;
        
        console.log(`\n${projectName}:`);
        if (impact.botVotesRemoved) {
          console.log(`  - Bot votes removed: ${impact.botVotesRemoved}`);
        }
        if (impact.ipDuplicatesRemoved) {
          console.log(`  - IP duplicates removed: ${impact.ipDuplicatesRemoved}`);
        }
        console.log(`  - Final vote count: ${impact.remainingVotes}`);
      }
    }
    
    // Save cleanup report
    cleanupResults.cleanupCriteria = cleanupCriteria;
    fs.writeFileSync('fraud-cleanup-report.json', JSON.stringify(cleanupResults, null, 2));
    console.log('\n💾 Cleanup report saved to: fraud-cleanup-report.json');
    
    return cleanupResults;
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Specific cleanup functions
async function removeVotesByIds(voteIds) {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    const votesCollection = db.collection('votes');
    const projectsCollection = db.collection('projects');
    
    // Get votes before deletion for project count updates
    const votesToRemove = await votesCollection.find({
      _id: { $in: voteIds }
    }).toArray();
    
    // Delete votes
    const result = await votesCollection.deleteMany({
      _id: { $in: voteIds }
    });
    
    // Update project counts
    const projectUpdates = {};
    votesToRemove.forEach(vote => {
      projectUpdates[vote.projectId] = (projectUpdates[vote.projectId] || 0) + 1;
    });
    
    for (const [projectId, removedCount] of Object.entries(projectUpdates)) {
      const remainingVotes = await votesCollection.countDocuments({ projectId });
      await projectsCollection.updateOne(
        { _id: projectId },
        { $set: { vote: remainingVotes } }
      );
    }
    
    console.log(`✅ Removed ${result.deletedCount} specific votes`);
    return result;
    
  } finally {
    await client.close();
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'auto') {
    console.log('🚀 Running automatic fraud cleanup...');
    await cleanupFraudulentVotes();
  } else if (command === 'python-only') {
    console.log('🤖 Removing only Python script votes...');
    await cleanupFraudulentVotes({ pythonOnly: true });
  } else if (command === 'ids') {
    const idsFile = args[1];
    if (!idsFile || !fs.existsSync(idsFile)) {
      console.log('Usage: node cleanup-fraud.js ids <file-with-vote-ids.json>');
      return;
    }
    
    const voteIds = JSON.parse(fs.readFileSync(idsFile, 'utf8'));
    await removeVotesByIds(voteIds);
  } else {
    console.log('🧹 FRAUD CLEANUP TOOL');
    console.log('=====================\n');
    console.log('Usage:');
    console.log('  node cleanup-fraud.js auto         # Automatic cleanup');
    console.log('  node cleanup-fraud.js python-only  # Remove only Python votes');
    console.log('  node cleanup-fraud.js ids <file>   # Remove specific vote IDs\n');
    console.log('Environment variables required:');
    console.log('  MONGODB_URI     - MongoDB connection string');
    console.log('  ENCRYPTION_KEY  - Decryption key (for analysis)');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { cleanupFraudulentVotes, removeVotesByIds };