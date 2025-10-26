# Security Enhancement Recommendations for OTP Voting System

## 1. Implement Comprehensive Rate Limiting

### API Rate Limiting Middleware
```typescript
// middleware/rateLimiter.ts
import { NextRequest, NextResponse } from "next/server";

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function createRateLimit(maxRequests: number, windowMs: number) {
  return (identifier: string): boolean => {
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);
    
    if (!entry || now > entry.resetTime) {
      rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (entry.count >= maxRequests) {
      return false;
    }
    
    entry.count++;
    return true;
  };
}

// Usage in endpoints
const otpRequestLimiter = createRateLimit(3, 15 * 60 * 1000); // 3 requests per 15 minutes
const checkOtpLimiter = createRateLimit(10, 60 * 1000); // 10 checks per minute
```

### Phone Number Specific Limits
```typescript
// Enhanced phone validation with rate limiting
async function validatePhoneWithRateLimit(phone: string, ip: string): Promise<boolean> {
  const phoneKey = `phone:${phone}`;
  const ipKey = `ip:${ip}`;
  
  // 3 OTP requests per phone per hour
  if (!otpRequestLimiter(phoneKey)) {
    throw new Error("Too many OTP requests for this phone number");
  }
  
  // 10 OTP requests per IP per hour
  if (!createRateLimit(10, 60 * 60 * 1000)(ipKey)) {
    throw new Error("Too many OTP requests from this IP");
  }
  
  return true;
}
```

## 2. Enhance OTP Security

### Cryptographically Secure OTP Generation
```typescript
import crypto from 'crypto';

function generateSecureOTP(): string {
  // Use cryptographically secure random number generation
  const randomBytes = crypto.randomBytes(4);
  const randomNumber = randomBytes.readUInt32BE(0);
  return (randomNumber % 900000 + 100000).toString();
}
```

### OTP Attempt Lockout
```typescript
// Add to OTP model
interface IOTP extends Document {
  // ... existing fields
  globalAttempts: number; // Track attempts across all sessions
  lastAttemptAt: Date;
  lockedUntil?: Date;
}

// In vote verification
async function verifyOTPWithLockout(sessionId: string, code: string) {
  const otp = await OTP.findById(sessionId);
  
  // Check if locked
  if (otp.lockedUntil && new Date() < otp.lockedUntil) {
    throw new Error("OTP temporarily locked due to too many attempts");
  }
  
  // Check attempts
  if (otp.globalAttempts >= 5) {
    // Lock for 30 minutes
    otp.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    await otp.save();
    throw new Error("Maximum attempts exceeded. OTP locked for 30 minutes.");
  }
  
  // Verify code...
}
```

## 3. Implement Request Validation Middleware

### CSRF Protection
```typescript
// middleware/csrf.ts
import { NextRequest } from "next/server";

export function validateCSRF(request: NextRequest): boolean {
  const token = request.headers.get('x-csrf-token');
  const referer = request.headers.get('referer');
  const origin = request.headers.get('origin');
  
  // Validate CSRF token and origin
  return token && (referer?.includes(process.env.NEXT_PUBLIC_BASE_URL!) || 
                  origin === process.env.NEXT_PUBLIC_BASE_URL);
}
```

### Input Sanitization
```typescript
// utils/sanitization.ts
import validator from 'validator';

export function sanitizeInput(input: string): string {
  return validator.escape(input.trim());
}

export function validateEmail(email: string): boolean {
  return validator.isEmail(email) && email.length <= 254;
}

export function validatePhoneSecure(phone: string): boolean {
  const cleaned = phone.replace(/[^\d+]/g, '');
  return /^\+234[789]\d{9}$/.test(cleaned) || /^0[789]\d{9}$/.test(cleaned);
}
```

## 4. Database Security Enhancements

### OTP Cleanup and TTL
```typescript
// Add TTL index for automatic cleanup
OTPSchema.index({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 }); // 24 hours

// Manual cleanup function
export async function cleanupExpiredOTPs() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await OTP.deleteMany({
    $or: [
      { used: true, updatedAt: { $lt: oneDayAgo } },
      { used: false, createdAt: { $lt: oneDayAgo } }
    ]
  });
}
```

### Encrypted Storage
```typescript
// Enhanced encryption for sensitive data
import crypto from 'crypto';

class SecureDataHandler {
  private static algorithm = 'aes-256-gcm';
  private static key = crypto.scryptSync(process.env.ENCRYPTION_KEY!, 'salt', 32);
  
  static encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }
  
  static decrypt(encrypted: string): string {
    const [ivHex, authTagHex, encryptedData] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

## 5. Timing Attack Prevention

### Constant Time Operations
```typescript
// Constant time comparison
function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// Add artificial delays to normalize response times
async function normalizeResponseTime<T>(operation: () => Promise<T>): Promise<T> {
  const start = Date.now();
  const result = await operation();
  const elapsed = Date.now() - start;
  
  // Ensure minimum response time of 100ms
  const minTime = 100;
  if (elapsed < minTime) {
    await new Promise(resolve => setTimeout(resolve, minTime - elapsed));
  }
  
  return result;
}
```

## 6. Enhanced Error Handling

### Secure Error Responses
```typescript
// utils/errorHandler.ts
export function createSecureErrorResponse(error: any, isDev = false) {
  const baseResponse = {
    success: false,
    message: "An error occurred",
    timestamp: new Date().toISOString()
  };
  
  if (isDev) {
    return {
      ...baseResponse,
      debug: {
        message: error.message,
        stack: error.stack
      }
    };
  }
  
  // Generic error messages for production
  const errorMap: Record<string, string> = {
    'RATE_LIMITED': 'Too many requests. Please try again later.',
    'INVALID_INPUT': 'Invalid input provided.',
    'OTP_EXPIRED': 'Verification code has expired.',
    'OTP_INVALID': 'Invalid verification code.',
    'PHONE_BLOCKED': 'This phone number is temporarily blocked.'
  };
  
  return {
    ...baseResponse,
    message: errorMap[error.code] || baseResponse.message
  };
}
```

## 7. Logging and Monitoring

### Security Event Logging
```typescript
// utils/securityLogger.ts
enum SecurityEventType {
  OTP_REQUEST = 'otp_request',
  OTP_VERIFY = 'otp_verify',
  RATE_LIMIT_HIT = 'rate_limit_hit',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity'
}

export function logSecurityEvent(
  type: SecurityEventType,
  details: Record<string, any>,
  severity: 'low' | 'medium' | 'high' = 'medium'
) {
  const event = {
    timestamp: new Date().toISOString(),
    type,
    severity,
    details: {
      ...details,
      // Remove sensitive data
      phoneNumber: details.phoneNumber ? 'XXX-XXX-' + details.phoneNumber.slice(-4) : undefined,
      email: details.email ? details.email.replace(/(.{2}).*(@.*)/, '$1***$2') : undefined
    }
  };
  
  console.log('[SECURITY]', JSON.stringify(event));
  
  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to monitoring service like DataDog, Sentry, etc.
  }
}
```

## 8. Implementation Priority

### Phase 1 (Critical - Implement Immediately)
1. Rate limiting on all OTP endpoints
2. Secure OTP generation
3. Request validation middleware
4. Error message sanitization

### Phase 2 (High Priority)
1. CSRF protection
2. Enhanced input validation
3. OTP cleanup mechanism
4. Security logging

### Phase 3 (Medium Priority)
1. Timing attack prevention
2. Enhanced encryption
3. Monitoring and alerting
4. Performance optimization

## 9. Configuration Examples

### Environment Variables
```env
# Security Configuration
ENCRYPTION_KEY=your-32-char-secret-key-here-change-this
CSRF_SECRET=your-csrf-secret-key-here
RATE_LIMIT_REDIS_URL=redis://localhost:6379
MAX_OTP_REQUESTS_PER_PHONE=3
MAX_OTP_REQUESTS_PER_IP=10
OTP_EXPIRY_MINUTES=5
OTP_LOCKOUT_ATTEMPTS=5
OTP_LOCKOUT_DURATION_MINUTES=30
```

### Security Headers Middleware
```typescript
// middleware/security.ts
export function securityHeaders(request: NextRequest) {
  const response = NextResponse.next();
  
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Content-Security-Policy', "default-src 'self'");
  
  return response;
}
```