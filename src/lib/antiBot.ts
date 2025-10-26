// lib/antiBot.ts - Anti-bot protection middleware
import { NextRequest } from "next/server";

export interface BotDetectionResult {
  isBot: boolean;
  reason?: string;
  userAgent: string;
  ipAddress: string;
}

// Suspicious user agent patterns that indicate automated scripts
const SUSPICIOUS_USER_AGENTS = [
  'python-requests',
  'curl/',
  'wget/',
  'node-fetch',
  'axios/',
  'urllib',
  'httpx/',
  'requests/',
  'bot',
  'crawler',
  'spider',
  'scrapy',
  'selenium',
  'phantomjs',
  'headless',
  'automated',
  'script'
];

// Rate limiting store for bot detection
const botAttemptStore = new Map<string, { count: number; resetTime: number }>();

export function detectBotAttack(request: NextRequest): BotDetectionResult {
  const userAgent = request.headers.get('user-agent') || '';
  const ipAddress = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';

  console.log(`🔍 Checking request - IP: ${ipAddress}, User-Agent: ${userAgent}`);

  // Check for suspicious user agent patterns
  const suspiciousPattern = SUSPICIOUS_USER_AGENTS.find(pattern => 
    userAgent.toLowerCase().includes(pattern.toLowerCase())
  );

  if (suspiciousPattern) {
    console.log(`🚨 BOT DETECTED: Suspicious user agent pattern "${suspiciousPattern}" from IP: ${ipAddress}`);
    logBotAttempt(ipAddress, userAgent, 'suspicious_user_agent');
    
    return {
      isBot: true,
      reason: `Automated script detected: ${suspiciousPattern}`,
      userAgent,
      ipAddress
    };
  }

  // Check for missing or empty user agent (common with scripts)
  if (!userAgent || userAgent.trim().length === 0) {
    console.log(`🚨 BOT DETECTED: Missing user agent from IP: ${ipAddress}`);
    logBotAttempt(ipAddress, userAgent, 'missing_user_agent');
    
    return {
      isBot: true,
      reason: 'Missing user agent',
      userAgent,
      ipAddress
    };
  }

  // Check for suspiciously short user agents
  if (userAgent.length < 20) {
    console.log(`🚨 BOT DETECTED: Suspiciously short user agent "${userAgent}" from IP: ${ipAddress}`);
    logBotAttempt(ipAddress, userAgent, 'short_user_agent');
    
    return {
      isBot: true,
      reason: 'Suspicious user agent format',
      userAgent,
      ipAddress
    };
  }

  // Additional checks for rapid requests from same IP
  if (checkRapidRequests(ipAddress)) {
    console.log(`🚨 BOT DETECTED: Rapid requests from IP: ${ipAddress}`);
    logBotAttempt(ipAddress, userAgent, 'rapid_requests');
    
    return {
      isBot: true,
      reason: 'Too many rapid requests',
      userAgent,
      ipAddress
    };
  }

  console.log(`✅ Request appears legitimate from IP: ${ipAddress}`);
  return {
    isBot: false,
    userAgent,
    ipAddress
  };
}

function checkRapidRequests(ipAddress: string): boolean {
  const now = Date.now();
  const entry = botAttemptStore.get(`rapid:${ipAddress}`);
  
  if (!entry || now > entry.resetTime) {
    // Reset counter every minute
    botAttemptStore.set(`rapid:${ipAddress}`, { 
      count: 1, 
      resetTime: now + 60 * 1000 
    });
    return false;
  }
  
  entry.count++;
  
  // More than 10 requests per minute is suspicious
  if (entry.count > 10) {
    return true;
  }
  
  return false;
}

function logBotAttempt(ipAddress: string, userAgent: string, reason: string) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: 'BOT_ATTACK_BLOCKED',
    ipAddress,
    userAgent,
    reason,
    severity: 'HIGH'
  };
  
  console.log('🛡️  [SECURITY] Bot attack blocked:', JSON.stringify(logEntry));
  
  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to monitoring service like DataDog, Sentry, etc.
  }
}

// Enhanced bot detection with more sophisticated checks
export function advancedBotDetection(request: NextRequest): BotDetectionResult {
  const basicResult = detectBotAttack(request);
  
  if (basicResult.isBot) {
    return basicResult;
  }
  
  const userAgent = basicResult.userAgent;
  
  // Check for suspicious browser combinations
  const suspiciousPatterns = [
    // Old browsers that are often used by bots
    /mozilla\/4\.0.*msie [1-6]\./i,
    // Suspicious version combinations
    /chrome\/1\d\./i, // Very old Chrome versions
    /safari\/53[0-4]\./i, // Very old Safari versions
    // Common bot signatures
    /^mozilla\/5\.0 \(compatible;\)/i,
    // Missing important browser details
    /^mozilla\/5\.0 \([^)]*\)$/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(userAgent)) {
      console.log(`🚨 ADVANCED BOT DETECTION: Suspicious browser pattern from IP: ${basicResult.ipAddress}`);
      logBotAttempt(basicResult.ipAddress, userAgent, 'suspicious_browser_pattern');
      
      return {
        isBot: true,
        reason: 'Suspicious browser signature',
        userAgent,
        ipAddress: basicResult.ipAddress
      };
    }
  }
  
  return basicResult;
}

// Whitelist legitimate user agents (optional)
const LEGITIMATE_USER_AGENTS = [
  'Mozilla/5.0', // Most legitimate browsers start with this
];

export function isWhitelistedUserAgent(userAgent: string): boolean {
  return LEGITIMATE_USER_AGENTS.some(pattern => 
    userAgent.startsWith(pattern)
  );
}