#!/usr/bin/env node

/**
 * LEGITIMATE SECURITY TESTING FRAMEWORK
 * 
 * This script helps test the security measures of your voting platform
 * in a controlled and legitimate manner. It validates your existing
 * anti-bot, email validation, and rate limiting protections.
 * 
 * USAGE: node security-test-framework.js [test-type] [project-id]
 * 
 * Test types:
 * - bot-detection: Test user-agent filtering and bot detection
 * - rate-limiting: Test request rate limiting
 * - email-validation: Test disposable email blocking
 * - all: Run all security tests
 */

const https = require('https');
const http = require('http');

class SecurityTestFramework {
  constructor(baseUrl = 'http://localhost:3000', projectId = 'test-project-id') {
    this.baseUrl = baseUrl;
    this.projectId = projectId;
    this.testResults = [];
    this.testStartTime = new Date();
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type}] ${message}`;
    console.log(logMessage);
    
    this.testResults.push({
      timestamp,
      type,
      message,
      test: this.currentTest || 'GENERAL'
    });
  }

  async makeRequest(endpoint, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.baseUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ...options.headers
        },
        timeout: 10000
      };

      const req = client.request(url, requestOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: parsed
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: { raw: data }
            });
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      
      if (options.body) {
        req.write(JSON.stringify(options.body));
      }
      
      req.end();
    });
  }

  // Test 1: Bot Detection Validation
  async testBotDetection() {
    this.currentTest = 'BOT_DETECTION';
    this.log('Starting bot detection tests...', 'TEST');

    const botUserAgents = [
      'python-requests/2.32.3',
      'curl/7.68.0',
      'node-fetch/2.6.7',
      'axios/0.27.2',
      'urllib3/1.26.7',
      'wget/1.21.2',
      '',  // Empty user agent
      'Bot'  // Short user agent
    ];

    let blockedCount = 0;
    let allowedCount = 0;

    for (const userAgent of botUserAgents) {
      try {
        const response = await this.makeRequest('/api/vote/request-otp', {
          headers: { 'User-Agent': userAgent },
          body: {
            phoneNumber: '+2347000000001',
            projectId: this.projectId
          }
        });

        if (response.status === 403 && response.data.code === 'BOT_DETECTED') {
          this.log(`✅ Bot detected and blocked: "${userAgent}"`, 'PASS');
          blockedCount++;
        } else {
          this.log(`❌ Bot NOT blocked: "${userAgent}" (Status: ${response.status})`, 'FAIL');
          allowedCount++;
        }
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        this.log(`Error testing user agent "${userAgent}": ${error.message}`, 'ERROR');
      }
    }

    this.log(`Bot detection summary: ${blockedCount} blocked, ${allowedCount} allowed`, 'SUMMARY');
    return { blocked: blockedCount, allowed: allowedCount };
  }

  // Test 2: Rate Limiting Validation
  async testRateLimiting() {
    this.currentTest = 'RATE_LIMITING';
    this.log('Starting rate limiting tests...', 'TEST');

    const requestCount = 15; // Should trigger rate limiting after 10
    let blockedRequests = 0;
    let successfulRequests = 0;

    this.log(`Sending ${requestCount} rapid requests to test rate limiting...`);

    // Send multiple requests rapidly
    const promises = [];
    for (let i = 0; i < requestCount; i++) {
      promises.push(
        this.makeRequest('/api/vote/request-otp', {
          body: {
            phoneNumber: `+234700000000${i.toString().padStart(2, '0')}`,
            projectId: this.projectId
          }
        }).then(response => ({ index: i, response }))
      );
    }

    const results = await Promise.allSettled(promises);
    
    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { index, response } = result.value;
        if (response.status === 403 && response.data.reason === 'Too many rapid requests') {
          this.log(`✅ Request ${index + 1} blocked by rate limiting`, 'PASS');
          blockedRequests++;
        } else {
          this.log(`Request ${index + 1} allowed (Status: ${response.status})`, 'INFO');
          successfulRequests++;
        }
      } else {
        this.log(`Request failed: ${result.reason}`, 'ERROR');
      }
    }

    this.log(`Rate limiting summary: ${blockedRequests} blocked, ${successfulRequests} allowed`, 'SUMMARY');
    return { blocked: blockedRequests, successful: successfulRequests };
  }

  // Test 3: Email Validation
  async testEmailValidation() {
    this.currentTest = 'EMAIL_VALIDATION';
    this.log('Starting email validation tests...', 'TEST');

    const disposableEmails = [
      'test@guerrillamailblock.com',
      'temp@tempmail.org',
      'fake@10minutemail.com',
      'spam@mailinator.com',
      'trash@yopmail.com'
    ];

    const legitimateEmails = [
      'user@gmail.com',
      'test@outlook.com',
      'valid@yahoo.com'
    ];

    let disposableBlocked = 0;
    let legitimateAllowed = 0;

    // Test disposable emails (should be blocked)
    this.log('Testing disposable email blocking...');
    for (let i = 0; i < disposableEmails.length; i++) {
      try {
        const response = await this.makeRequest('/api/vote/request-otp-email', {
          body: {
            email: disposableEmails[i],
            projectId: this.projectId
          }
        });

        if (response.status === 400 && response.data.message?.includes('disposable')) {
          this.log(`✅ Disposable email blocked: ${disposableEmails[i]}`, 'PASS');
          disposableBlocked++;
        } else {
          this.log(`❌ Disposable email NOT blocked: ${disposableEmails[i]}`, 'FAIL');
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        this.log(`Error testing disposable email: ${error.message}`, 'ERROR');
      }
    }

    // Test legitimate emails (should be allowed - but we'll just check format validation)
    this.log('Testing legitimate email handling...');
    for (let i = 0; i < legitimateEmails.length; i++) {
      try {
        const response = await this.makeRequest('/api/vote/request-otp-email', {
          body: {
            email: legitimateEmails[i],
            projectId: this.projectId
          }
        });

        // We expect either success or failure not related to disposable emails
        if (response.data.message && !response.data.message.includes('disposable')) {
          this.log(`✅ Legitimate email processed: ${legitimateEmails[i]}`, 'PASS');
          legitimateAllowed++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        this.log(`Error testing legitimate email: ${error.message}`, 'ERROR');
      }
    }

    this.log(`Email validation summary: ${disposableBlocked}/${disposableEmails.length} disposable blocked, ${legitimateAllowed}/${legitimateEmails.length} legitimate processed`, 'SUMMARY');
    return { disposableBlocked, legitimateAllowed };
  }

  // Test 4: IP Security (if enabled)
  async testIPSecurity() {
    this.currentTest = 'IP_SECURITY';
    this.log('Testing IP security measures...', 'TEST');

    try {
      const response = await this.makeRequest('/api/vote/request-otp', {
        headers: {
          'X-Forwarded-For': '1.2.3.4', // Simulate external IP
          'X-Real-IP': '1.2.3.4'
        },
        body: {
          phoneNumber: '+2347000000999',
          projectId: this.projectId
        }
      });

      if (response.status === 403 && response.data.code === 'IP_NOT_AUTHORIZED') {
        this.log('✅ IP restriction working - external IP blocked', 'PASS');
        return { ipSecurityActive: true };
      } else {
        this.log('ℹ️ IP restriction not active or external IP allowed', 'INFO');
        return { ipSecurityActive: false };
      }
    } catch (error) {
      this.log(`Error testing IP security: ${error.message}`, 'ERROR');
      return { ipSecurityActive: false };
    }
  }

  // Generate comprehensive security report
  generateReport() {
    const endTime = new Date();
    const duration = endTime - this.testStartTime;

    const report = {
      testSummary: {
        startTime: this.testStartTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: `${Math.round(duration / 1000)}s`,
        totalTests: this.testResults.length
      },
      securityStatus: {
        botDetection: this.testResults.filter(r => r.test === 'BOT_DETECTION' && r.type === 'PASS').length > 0,
        rateLimiting: this.testResults.filter(r => r.test === 'RATE_LIMITING' && r.type === 'PASS').length > 0,
        emailValidation: this.testResults.filter(r => r.test === 'EMAIL_VALIDATION' && r.type === 'PASS').length > 0,
        ipSecurity: this.testResults.filter(r => r.test === 'IP_SECURITY' && r.type === 'PASS').length > 0
      },
      recommendations: [],
      fullResults: this.testResults
    };

    // Add recommendations based on test results
    Object.entries(report.securityStatus).forEach(([feature, isActive]) => {
      if (!isActive) {
        report.recommendations.push(`Consider enabling or strengthening ${feature.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
      }
    });

    return report;
  }

  async runAllTests() {
    this.log('🛡️ Starting Security Test Framework', 'START');
    this.log(`Testing URL: ${this.baseUrl}`);
    this.log(`Project ID: ${this.projectId}`);
    this.log('=' * 50);

    try {
      await this.testBotDetection();
      await new Promise(resolve => setTimeout(resolve, 2000)); // Brief pause between tests
      
      await this.testRateLimiting();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await this.testEmailValidation();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await this.testIPSecurity();

      this.log('=' * 50);
      this.log('🏁 All security tests completed', 'COMPLETE');

      const report = this.generateReport();
      
      // Save report to file
      const fs = require('fs');
      const reportPath = `security-test-report-${Date.now()}.json`;
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      
      this.log(`📊 Security report saved to: ${reportPath}`, 'INFO');
      
      return report;

    } catch (error) {
      this.log(`❌ Test framework error: ${error.message}`, 'ERROR');
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const testType = args[0] || 'all';
  const projectId = args[1] || 'test-project-id';
  const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

  console.log('🔒 LEGITIMATE SECURITY TESTING FRAMEWORK');
  console.log('=========================================');
  console.log(`Test Type: ${testType}`);
  console.log(`Project ID: ${projectId}`);
  console.log(`Base URL: ${baseUrl}`);
  console.log('');

  const framework = new SecurityTestFramework(baseUrl, projectId);

  try {
    let results;
    
    switch (testType) {
      case 'bot-detection':
        results = await framework.testBotDetection();
        break;
      case 'rate-limiting':
        results = await framework.testRateLimiting();
        break;
      case 'email-validation':
        results = await framework.testEmailValidation();
        break;
      case 'ip-security':
        results = await framework.testIPSecurity();
        break;
      case 'all':
      default:
        results = await framework.runAllTests();
        break;
    }

    console.log('\n📋 Test Results Summary:');
    console.log(JSON.stringify(results, null, 2));

  } catch (error) {
    console.error('❌ Testing failed:', error.message);
    process.exit(1);
  }
}

// Export for use as module
module.exports = SecurityTestFramework;

// Run as CLI if called directly
if (require.main === module) {
  main();
}