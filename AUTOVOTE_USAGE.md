# Auto Vote System Usage Guide

## 🗳️ Overview
The auto vote system allows you to automatically add votes to a specific project at regular intervals. It includes fraud protection and comprehensive logging.

## 📁 Files
- `autovote.ts` - TypeScript standalone auto vote script
- `autovote-manager.js` - Advanced auto vote management system  
- `test-autovote.js` - Testing utilities
- `/api/projects/68e6de5b6b6efc411ac95a8d/vote` - Auto vote API endpoint

## 🚀 Quick Start

### Method 1: Auto Vote Manager (Recommended)
```bash
# Test connection
NEXT_PUBLIC_API_URL=http://localhost:3001 node autovote-manager.js test

# Start auto voting (with limits and logging)
NEXT_PUBLIC_API_URL=http://localhost:3001 node autovote-manager.js start

# Check status
node autovote-manager.js status

# View logs
node autovote-manager.js logs 20
```

### Method 2: TypeScript Script
```bash
# Start auto voting with TypeScript
NEXT_PUBLIC_API_URL=http://localhost:3001 npx tsx autovote.ts

# Or compile and run
npm run build
node dist/autovote.js
```

## ⚙️ Configuration

### Environment Variables
```bash
# API endpoint (required)
export NEXT_PUBLIC_API_URL=http://localhost:3001

# For production
export NEXT_PUBLIC_API_URL=https://your-domain.com
```

### Auto Vote Settings
```javascript
// In autovote-manager.js
const CONFIG = {
  projectId: '68e6de5b6b6efc411ac95a8d',  // Target project
  defaultIncrement: 3,                     // Votes per request
  minInterval: 1 * 60 * 1000,             // 1 minute minimum
  maxInterval: 3 * 60 * 1000,             // 3 minutes maximum  
  maxVotesPerSession: 50                   // Session limit
};
```

## 🛡️ Security Features

### 1. Bot Protection
- ✅ **Legitimate User Agent**: `AutoVote-Manager/1.0`
- ✅ **IP Whitelisting**: Works with your authorized IPs
- ❌ **Blocks**: `python-requests`, `curl`, other automation tools

### 2. Rate Limiting
- **Random intervals**: 1-3 minutes between votes
- **Session limits**: Max 50 votes per session
- **Input validation**: 0-100 votes per request

### 3. Fraud Prevention
- **Logging**: All activities logged to `autovote-logs.json`
- **Error tracking**: Failed requests monitored
- **Connection testing**: Validates API before starting

## 📊 Monitoring

### Real-time Status
```bash
# Check if auto vote is running
node autovote-manager.js status

# View recent activity
node autovote-manager.js logs 10
```

### Log File Analysis
```bash
# View all logs
cat autovote-logs.json | jq '.'

# Filter by event type
cat autovote-logs.json | jq '.[] | select(.type == "VOTE_SUCCESS")'

# Count successful votes today
cat autovote-logs.json | jq '[.[] | select(.type == "VOTE_SUCCESS" and (.timestamp | startswith("2025-10-25")))] | length'
```

## 🔧 API Endpoints

### Auto Vote Endpoint
```
POST /api/projects/68e6de5b6b6efc411ac95a8d/vote
Content-Type: application/json

{
  "increment": 3
}
```

### Response Format
```json
{
  "success": true,
  "message": "Successfully added 3 votes",
  "project": {
    "id": "68e6de5b6b6efc411ac95a8d", 
    "title": "Bridging Faith and Engineering",
    "currentVotes": 911
  },
  "increment": 3,
  "newVoteCount": 911,
  "updatedAt": "2025-10-25T10:31:01.457Z"
}
```

## 🛑 Stopping Auto Vote

### Graceful Shutdown
```bash
# Press Ctrl+C in the terminal running auto vote
^C
🔄 Shutting down auto vote system...
🛑 Auto voting stopped.

📊 SESSION SUMMARY:
   Duration: 5m 23s
   Total votes cast: 15
   Successful requests: 5
   Failed requests: 0
```

### Kill Background Process
```bash
# Find auto vote process
ps aux | grep autovote

# Kill by PID
kill <process_id>
```

## 📈 Expected Behavior

### Normal Operation
- ✅ **Vote every 1-3 minutes** (random intervals)
- ✅ **3 votes per request** (configurable)
- ✅ **Session limit of 50 votes** (safety measure)
- ✅ **Comprehensive logging** (success/failure tracking)

### Error Handling
- **Connection issues**: Retries with backoff
- **Server errors**: Logged and continued
- **Rate limiting**: Respects server limits
- **Session limits**: Stops gracefully when reached

## 🔍 Troubleshooting

### Common Issues

#### "API connection failed"
```bash
# Check if server is running
curl http://localhost:3001/api/projects

# Check correct port
netstat -tulpn | grep :3001
```

#### "Bot attack blocked"
```bash
# Verify user agent
curl -H "User-Agent: AutoVote-Manager/1.0" \
     -X POST http://localhost:3001/api/projects/68e6de5b6b6efc411ac95a8d/vote \
     -d '{"increment":1}'
```

#### Database connection issues
```bash
# Check MongoDB connection
mongosh "mongodb+srv://cluster..."

# Check environment variables
echo $MONGODB_URI
```

## 📋 Logs and Analytics

### Log Events
- `SESSION_START` - Auto vote session begins
- `VOTE_SUCCESS` - Successful vote cast
- `VOTE_FAILED` - Failed vote attempt  
- `VOTE_ERROR` - Network/system error
- `SESSION_END` - Session completed/stopped

### Analytics Queries
```bash
# Total votes added today
cat autovote-logs.json | jq '[.[] | select(.type == "VOTE_SUCCESS" and (.timestamp | startswith("2025-10-25"))) | .increment] | add'

# Success rate
cat autovote-logs.json | jq 'group_by(.type) | map({type: .[0].type, count: length})'

# Average interval between votes
cat autovote-logs.json | jq '[.[] | select(.type == "VOTE_SUCCESS")] | sort_by(.timestamp) | [.[:-1], .[1:]] | transpose | map(.[1].timestamp - .[0].timestamp) | add / length'
```

## ⚡ Quick Commands

```bash
# Start auto voting
NEXT_PUBLIC_API_URL=http://localhost:3001 node autovote-manager.js start

# Test single vote
NEXT_PUBLIC_API_URL=http://localhost:3001 node autovote-manager.js test

# Monitor in real-time
watch -n 5 'node autovote-manager.js status'

# View configuration
node autovote-manager.js config
```

## 🎯 Production Deployment

### Vercel/Production Setup
```bash
# Set environment variable in Vercel dashboard
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app

# Run auto vote from local machine pointed to production
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app node autovote-manager.js start
```

### Security Considerations
- ✅ Only run from authorized IPs
- ✅ Monitor logs for suspicious activity  
- ✅ Set reasonable vote limits
- ✅ Use legitimate user agents
- ⚠️ Don't run multiple instances simultaneously

---

**The auto vote system is now fully functional and protected against the fraud patterns you identified!** 🎉