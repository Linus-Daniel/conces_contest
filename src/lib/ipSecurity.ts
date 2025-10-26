// IP Security and Database Access Control
import { NextRequest } from "next/server";

// Your allowed IP addresses - UPDATE THESE WITH YOUR ACTUAL IPs
const ALLOWED_IPS = [
  // Your laptop IP (you need to add your actual IP)
  '105.117.2.47', // Your laptop/office IP
  
  // Vercel deployment IPs (Vercel uses dynamic IPs, but these are common ranges)
  // Note: Vercel IPs change, so we'll need a different approach for production
  
  // For development, allow localhost
  '127.0.0.1',
  '::1',
  'localhost',
  
  // Add your specific IPs here
  // Example: '192.168.1.100', // Your home IP
  // Example: '203.0.113.0',   // Your office IP
];

// IP ranges for Vercel (these can change, so this is just a starting point)
const VERCEL_IP_RANGES = [
  // Vercel's edge network (these are examples - you'd need to get actual ranges)
  '76.76.19.0/24',
  '76.223.126.0/24',
  // Note: Vercel uses many IPs, consider using request headers instead
];

export interface IPCheckResult {
  allowed: boolean;
  ip: string;
  reason?: string;
  source: 'localhost' | 'whitelist' | 'vercel' | 'blocked';
}

export function getClientIP(request: NextRequest): string {
  // Try different headers to get the real IP
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIP = request.headers.get('x-real-ip');
  const xClientIP = request.headers.get('x-client-ip');
  
  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return xForwardedFor.split(',')[0].trim();
  }
  
  if (xRealIP) {
    return xRealIP;
  }
  
  if (xClientIP) {
    return xClientIP;
  }
  
  // Fallback to connection IP (might not work in serverless)
  return 'unknown';
}

export function checkIPAccess(request: NextRequest): IPCheckResult {
  const clientIP = getClientIP(request);
  
  console.log(`🔒 IP Access Check: ${clientIP}`);
  
  // Check for localhost (development)
  if (clientIP === '127.0.0.1' || clientIP === '::1' || clientIP === 'localhost') {
    return {
      allowed: true,
      ip: clientIP,
      source: 'localhost'
    };
  }
  
  // Check whitelist
  if (ALLOWED_IPS.includes(clientIP)) {
    return {
      allowed: true,
      ip: clientIP,
      source: 'whitelist'
    };
  }
  
  // Check if request is from Vercel (using headers)
  const vercelHeaders = [
    'x-vercel-id',
    'x-vercel-deployment-url',
    'x-vercel-forwarded-for'
  ];
  
  const hasVercelHeaders = vercelHeaders.some(header => 
    request.headers.get(header) !== null
  );
  
  if (hasVercelHeaders) {
    console.log('🟢 Request from Vercel detected via headers');
    return {
      allowed: true,
      ip: clientIP,
      source: 'vercel'
    };
  }
  
  // Block all other IPs
  console.log(`🚫 IP Access DENIED: ${clientIP}`);
  return {
    allowed: false,
    ip: clientIP,
    reason: 'IP address not in whitelist',
    source: 'blocked'
  };
}

// Middleware to restrict database access by IP
export function restrictDatabaseAccess(request: NextRequest): { allowed: boolean; response?: Response } {
  const ipCheck = checkIPAccess(request);
  
  if (!ipCheck.allowed) {
    console.log(`🚫 Database access denied for IP: ${ipCheck.ip}`);
    
    const response = new Response(
      JSON.stringify({
        error: 'Access denied',
        message: 'Database access is restricted to authorized IPs only',
        code: 'IP_NOT_AUTHORIZED'
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    return { allowed: false, response };
  }
  
  console.log(`✅ Database access granted for IP: ${ipCheck.ip} (source: ${ipCheck.source})`);
  return { allowed: true };
}

// Function to add your IPs to the whitelist
export function addIPToWhitelist(ip: string): boolean {
  if (!ALLOWED_IPS.includes(ip)) {
    ALLOWED_IPS.push(ip);
    console.log(`✅ Added IP to whitelist: ${ip}`);
    return true;
  }
  return false;
}

// Helper function to check if current environment needs IP restriction
export function shouldRestrictIP(): boolean {
  // Only restrict in production or when specifically enabled
  return process.env.NODE_ENV === 'production' || 
         process.env.ENABLE_IP_RESTRICTION === 'true';
}