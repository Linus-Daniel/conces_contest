#!/usr/bin/env tsx

/**
 * Standalone Auto Vote Script
 * 
 * This script automatically adds votes to a specific project at random intervals.
 * It can be run independently with: npx tsx autovote.ts
 */

const PROJECT_ID = '68e6de5b6b6efc411ac95a8d';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const VOTE_INCREMENT = 1;
const MIN_INTERVAL_MINUTES = 1;
const MAX_INTERVAL_MINUTES = 15;

interface VoteResponse {
  success: boolean;
  message: string;
  project: {
    id: string;
    title: string;
    currentVotes: number;
    candidate: any;
  };
  increment: number;
  newVoteCount: number;
  updatedAt: string;
}

let isRunning = false;
let currentTimeout: NodeJS.Timeout | null = null;

/**
 * Sends a vote request to the API
 */
async function sendVote(): Promise<boolean> {
  try {
    console.log(`\n🗳️  Sending auto vote...`);
    console.log(`   Project: ${PROJECT_ID}`);
    console.log(`   Increment: +${VOTE_INCREMENT}`);
    console.log(`   Time: ${new Date().toLocaleString()}`);

    const response = await fetch(`${API_URL}/api/projects/${PROJECT_ID}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ increment: VOTE_INCREMENT }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Vote failed: ${response.status} ${response.statusText}`);
      console.error(`   Response: ${errorText}`);
      return false;
    }

    const result: VoteResponse = await response.json();
    
    if (result.success) {
      console.log(`✅ Vote successful!`);
      console.log(`   Project: "${result.project.title}"`);
      console.log(`   New total: ${result.newVoteCount} votes`);
      console.log(`   Added: +${result.increment}`);
      return true;
    } else {
      console.error(`❌ Vote failed: ${result.message}`);
      return false;
    }

  } catch (error) {
    console.error('❌ Auto vote error:', error);
    return false;
  }
}

/**
 * Generates a random interval between min and max minutes
 */
function getRandomInterval(): number {
  const randomMinutes = Math.random() * (MAX_INTERVAL_MINUTES - MIN_INTERVAL_MINUTES) + MIN_INTERVAL_MINUTES;
  return Math.floor(randomMinutes * 60 * 1000); // Convert to milliseconds
}

/**
 * Schedules the next vote
 */
function scheduleNextVote(): void {
  if (!isRunning) return;

  const intervalMs = getRandomInterval();
  const nextVoteTime = new Date(Date.now() + intervalMs);
  
  console.log(`⏰ Next vote scheduled for: ${nextVoteTime.toLocaleString()}`);
  console.log(`   (in ${Math.floor(intervalMs / 60000)} minutes)`);

  currentTimeout = setTimeout(async () => {
    if (!isRunning) return;
    
    await sendVote();
    scheduleNextVote(); // Schedule the next one
  }, intervalMs);
}

/**
 * Starts the auto voting process
 */
function startAutoVoting(): void {
  if (isRunning) {
    console.log('⚠️  Auto voting is already running!');
    return;
  }

  isRunning = true;
  console.log('\n🚀 Starting auto vote system...');
  console.log(`   Project ID: ${PROJECT_ID}`);
  console.log(`   Vote increment: +${VOTE_INCREMENT}`);
  console.log(`   Interval: ${MIN_INTERVAL_MINUTES}-${MAX_INTERVAL_MINUTES} minutes`);
  console.log(`   API URL: ${API_URL}`);
  console.log('   Press Ctrl+C to stop\n');

  // Send first vote immediately
  sendVote().then(() => {
    scheduleNextVote();
  });
}

/**
 * Stops the auto voting process
 */
function stopAutoVoting(): void {
  if (!isRunning) {
    console.log('⚠️  Auto voting is not running.');
    return;
  }

  isRunning = false;
  
  if (currentTimeout) {
    clearTimeout(currentTimeout);
    currentTimeout = null;
  }

  console.log('\n🛑 Auto voting stopped.');
}

/**
 * Handles graceful shutdown
 */
function handleShutdown(): void {
  console.log('\n\n🔄 Shutting down auto vote system...');
  stopAutoVoting();
  process.exit(0);
}

// Handle shutdown signals
process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);

// CLI interface
function showHelp(): void {
  console.log(`
🗳️  Auto Vote System

Usage:
  npx tsx autovote.ts [command]

Commands:
  start    Start auto voting (default)
  stop     Stop auto voting (if running in another process)
  help     Show this help message

Environment Variables:
  NEXT_PUBLIC_API_URL    API base URL (default: http://localhost:3000)

Examples:
  npx tsx autovote.ts
  npx tsx autovote.ts start
  NEXT_PUBLIC_API_URL=https://myapp.com npx tsx autovote.ts
`);
}

// Main execution
async function main(): Promise<void> {
  const command = process.argv[2] || 'start';

  switch (command) {
    case 'start':
      startAutoVoting();
      break;
    case 'stop':
      // In a real scenario, you'd implement IPC to stop a running process
      console.log('⚠️  Stop command not implemented for standalone script.');
      console.log('   Use Ctrl+C to stop a running instance.');
      break;
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    default:
      console.error(`❌ Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch((error: any) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { startAutoVoting, stopAutoVoting, sendVote };