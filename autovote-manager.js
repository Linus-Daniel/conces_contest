// autovote-manager.js - Comprehensive auto vote management system
const axios = require('axios');
const fs = require('fs');

const CONFIG = {
  projectId: '68e6de5b6b6efc411ac95a8d',
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  defaultIncrement: 3,
  minInterval: 1 * 60 * 1000, // 1 minute
  maxInterval: 3 * 60 * 1000, // 3 minutes
  maxVotesPerSession: 50,
  logFile: 'autovote-logs.json'
};

class AutoVoteManager {
  constructor() {
    this.isRunning = false;
    this.currentTimeout = null;
    this.sessionStats = {
      startTime: null,
      totalVotes: 0,
      successfulVotes: 0,
      failedVotes: 0,
      errors: []
    };
    this.logs = this.loadLogs();
  }

  loadLogs() {
    try {
      if (fs.existsSync(CONFIG.logFile)) {
        return JSON.parse(fs.readFileSync(CONFIG.logFile, 'utf8'));
      }
    } catch (error) {
      console.warn('Could not load existing logs:', error.message);
    }
    return [];
  }

  saveLogs() {
    try {
      fs.writeFileSync(CONFIG.logFile, JSON.stringify(this.logs, null, 2));
    } catch (error) {
      console.error('Could not save logs:', error.message);
    }
  }

  logEvent(type, data) {
    const event = {
      timestamp: new Date().toISOString(),
      type,
      ...data
    };
    
    this.logs.push(event);
    console.log(`📝 ${type}: ${JSON.stringify(data)}`);
    
    // Keep only last 1000 log entries
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
    
    this.saveLogs();
  }

  async sendVote(increment = CONFIG.defaultIncrement) {
    try {
      console.log(`\n🗳️  Sending auto vote...`);
      console.log(`   Project: ${CONFIG.projectId}`);
      console.log(`   Increment: +${increment}`);
      console.log(`   Time: ${new Date().toLocaleString()}`);

      const response = await axios.post(
        `${CONFIG.baseUrl}/api/projects/${CONFIG.projectId}/vote`,
        { increment },
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'AutoVote-Manager/1.0' // Legitimate user agent
          },
          timeout: 10000,
          validateStatus: () => true // Don't throw on any status
        }
      );

      if (response.status === 200 && response.data.success) {
        console.log(`✅ Vote successful!`);
        console.log(`   Project: "${response.data.project.title}"`);
        console.log(`   New total: ${response.data.newVoteCount} votes`);
        console.log(`   Added: +${response.data.increment}`);
        
        this.sessionStats.successfulVotes++;
        this.sessionStats.totalVotes += increment;
        
        this.logEvent('VOTE_SUCCESS', {
          increment,
          newTotal: response.data.newVoteCount,
          projectTitle: response.data.project.title
        });
        
        return { success: true, data: response.data };
      } else {
        console.error(`❌ Vote failed: ${response.status} ${response.statusText}`);
        console.error(`   Response:`, response.data);
        
        this.sessionStats.failedVotes++;
        this.sessionStats.errors.push({
          status: response.status,
          message: response.data.message || response.statusText,
          timestamp: new Date().toISOString()
        });
        
        this.logEvent('VOTE_FAILED', {
          status: response.status,
          error: response.data.message || response.statusText,
          increment
        });
        
        return { success: false, error: response.data };
      }

    } catch (error) {
      console.error('❌ Auto vote error:', error.message);
      
      this.sessionStats.failedVotes++;
      this.sessionStats.errors.push({
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      this.logEvent('VOTE_ERROR', {
        error: error.message,
        code: error.code,
        increment
      });
      
      return { success: false, error: error.message };
    }
  }

  getRandomInterval() {
    const randomMs = Math.random() * (CONFIG.maxInterval - CONFIG.minInterval) + CONFIG.minInterval;
    return Math.floor(randomMs);
  }

  scheduleNextVote() {
    if (!this.isRunning) return;

    // Check if we've reached the session limit
    if (this.sessionStats.totalVotes >= CONFIG.maxVotesPerSession) {
      console.log(`\n🎯 Session limit reached (${CONFIG.maxVotesPerSession} votes)`);
      this.stop();
      return;
    }

    const intervalMs = this.getRandomInterval();
    const nextVoteTime = new Date(Date.now() + intervalMs);
    
    console.log(`⏰ Next vote scheduled for: ${nextVoteTime.toLocaleString()}`);
    console.log(`   (in ${Math.floor(intervalMs / 60000)} minutes ${Math.floor((intervalMs % 60000) / 1000)} seconds)`);

    this.currentTimeout = setTimeout(async () => {
      if (!this.isRunning) return;
      
      await this.sendVote();
      this.scheduleNextVote();
    }, intervalMs);
  }

  start(options = {}) {
    if (this.isRunning) {
      console.log('⚠️  Auto voting is already running!');
      return false;
    }

    this.isRunning = true;
    this.sessionStats = {
      startTime: new Date().toISOString(),
      totalVotes: 0,
      successfulVotes: 0,
      failedVotes: 0,
      errors: []
    };

    console.log('\n🚀 Starting auto vote system...');
    console.log(`   Project ID: ${CONFIG.projectId}`);
    console.log(`   Vote increment: +${CONFIG.defaultIncrement}`);
    console.log(`   Interval: ${CONFIG.minInterval/60000}-${CONFIG.maxInterval/60000} minutes`);
    console.log(`   API URL: ${CONFIG.baseUrl}`);
    console.log(`   Max votes this session: ${CONFIG.maxVotesPerSession}`);
    console.log('   Press Ctrl+C to stop\n');

    this.logEvent('SESSION_START', {
      projectId: CONFIG.projectId,
      maxVotes: CONFIG.maxVotesPerSession
    });

    // Send first vote immediately if requested
    if (options.immediate !== false) {
      this.sendVote().then(() => {
        this.scheduleNextVote();
      });
    } else {
      this.scheduleNextVote();
    }

    return true;
  }

  stop() {
    if (!this.isRunning) {
      console.log('⚠️  Auto voting is not running.');
      return false;
    }

    this.isRunning = false;
    
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }

    const duration = this.sessionStats.startTime ? 
      Math.floor((new Date() - new Date(this.sessionStats.startTime)) / 1000) : 0;

    console.log('\n🛑 Auto voting stopped.');
    console.log('\n📊 SESSION SUMMARY:');
    console.log(`   Duration: ${Math.floor(duration/60)}m ${duration%60}s`);
    console.log(`   Total votes cast: ${this.sessionStats.totalVotes}`);
    console.log(`   Successful requests: ${this.sessionStats.successfulVotes}`);
    console.log(`   Failed requests: ${this.sessionStats.failedVotes}`);
    
    if (this.sessionStats.errors.length > 0) {
      console.log(`   Errors encountered: ${this.sessionStats.errors.length}`);
    }

    this.logEvent('SESSION_END', {
      duration,
      ...this.sessionStats
    });

    return true;
  }

  async testConnection() {
    console.log('🔍 Testing auto vote connection...');
    
    try {
      // Test the actual auto vote endpoint instead
      const response = await axios.post(
        `${CONFIG.baseUrl}/api/projects/${CONFIG.projectId}/vote`,
        { increment: 0 }, // Test with 0 increment
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'AutoVote-Manager/1.0'
          },
          timeout: 15000,
          validateStatus: () => true
        }
      );
      
      if (response.status === 200 || response.status === 400) {
        console.log('✅ API connection successful');
        return true;
      } else {
        console.log(`❌ API connection failed: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ API connection error: ${error.message}`);
      // Still return true if it's just a timeout but the vote endpoint exists
      if (error.code === 'ECONNABORTED') {
        console.log('⚠️  Connection slow but proceeding...');
        return true;
      }
      return false;
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      sessionStats: this.sessionStats,
      config: CONFIG,
      nextVoteScheduled: this.currentTimeout ? true : false
    };
  }

  getRecentLogs(count = 10) {
    return this.logs.slice(-count);
  }
}

// CLI interface
async function main() {
  const manager = new AutoVoteManager();
  const command = process.argv[2] || 'help';
  
  // Handle shutdown signals gracefully
  process.on('SIGINT', () => {
    console.log('\n\n🔄 Shutting down auto vote system...');
    manager.stop();
    process.exit(0);
  });

  switch (command) {
    case 'start':
      const connected = await manager.testConnection();
      if (connected) {
        manager.start();
      } else {
        console.log('❌ Cannot start - API connection failed');
        process.exit(1);
      }
      break;

    case 'test':
      await manager.testConnection();
      const result = await manager.sendVote(1);
      console.log('\n🧪 Test result:', result.success ? 'SUCCESS' : 'FAILED');
      break;

    case 'status':
      console.log('📊 Current Status:', JSON.stringify(manager.getStatus(), null, 2));
      break;

    case 'logs':
      const count = parseInt(process.argv[3]) || 10;
      console.log(`📝 Recent logs (last ${count}):`);
      console.log(JSON.stringify(manager.getRecentLogs(count), null, 2));
      break;

    case 'config':
      console.log('⚙️  Configuration:', JSON.stringify(CONFIG, null, 2));
      break;

    case 'help':
    default:
      console.log(`
🗳️  Auto Vote Manager

Usage:
  node autovote-manager.js [command]

Commands:
  start      Start auto voting system
  test       Test connection and send one vote
  status     Show current status
  logs [n]   Show recent logs (default: 10)
  config     Show configuration
  help       Show this help

Environment Variables:
  NEXT_PUBLIC_API_URL    API base URL (default: http://localhost:3000)

Examples:
  node autovote-manager.js start
  node autovote-manager.js test
  node autovote-manager.js logs 20
      `);
      break;
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = AutoVoteManager;