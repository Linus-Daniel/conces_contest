const fs = require('fs');

// Load analysis results
const analysis = JSON.parse(fs.readFileSync('vote-analysis-results.json', 'utf8'));

// Helper function to get pattern distribution
function getPatternDistribution() {
  const patterns = {
    'DISPOSABLE_EMAIL': 0,
    'TEST_EMAIL_ALIAS': 0,
    'SEQUENTIAL_NUMBERS': 0,
    'BOT_USER_AGENT': 0
  };
  
  analysis.suspiciousPatterns.forEach(vote => {
    vote.suspiciousPatterns.forEach(pattern => {
      patterns[pattern] = (patterns[pattern] || 0) + 1;
    });
  });
  
  return patterns;
}

// Helper function to get disposable domain distribution
function getDisposableDomains() {
  const domains = {};
  analysis.disposableEmails.forEach(vote => {
    domains[vote.domain] = (domains[vote.domain] || 0) + 1;
  });
  
  return Object.entries(domains)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
}

// Generate report
const patternDist = getPatternDistribution();
const disposableDomains = getDisposableDomains();
const fraudPercentage = ((analysis.disposableEmails.length / analysis.totalVotes) * 100).toFixed(2);
const legitimateVotes = analysis.totalVotes - analysis.disposableEmails.length;
const legitimatePercentage = ((legitimateVotes / analysis.totalVotes) * 100).toFixed(2);

let riskLevel = '🟢 LOW';
if (analysis.disposableEmails.length / analysis.totalVotes > 0.2) {
  riskLevel = '🔴 HIGH';
} else if (analysis.disposableEmails.length / analysis.totalVotes > 0.1) {
  riskLevel = '🟡 MEDIUM';
}

const report = `# Vote Fraud Analysis Report
*Generated: ${new Date().toISOString()}*

## 🚨 CRITICAL FINDINGS

### Summary
- **Total Votes Analyzed:** ${analysis.totalVotes.toLocaleString()}
- **Duplicate Emails:** ${Object.keys(analysis.duplicateEmails).length}
- **Disposable Emails:** ${analysis.disposableEmails.length.toLocaleString()}
- **Suspicious Activities:** ${analysis.suspiciousPatterns.length.toLocaleString()}
- **Suspicious IPs (>10 votes):** ${analysis.suspiciousIPs.length}

---

## 📧 DUPLICATE EMAIL ANALYSIS

${Object.keys(analysis.duplicateEmails).length === 0 ? '✅ **No duplicate emails found**' : 
Object.entries(analysis.duplicateEmails).map(([email, data]) => `
### ${email}
- **Vote Count:** ${data.count}
- **Projects Voted:** ${data.votes.map(v => v.projectId).join(', ')}
- **Vote Times:** ${data.votes.map(v => new Date(v.votedAt).toLocaleString()).join(', ')}
- **IP Addresses:** ${[...new Set(data.votes.map(v => v.ipAddress))].join(', ')}
`).join('')}

---

## 🗑️ DISPOSABLE EMAIL ANALYSIS

### Top Disposable Domains
${disposableDomains.map(([domain, count]) => `- **${domain}:** ${count} votes`).join('\n')}

### Sample Disposable Email Votes (First 20)
${analysis.disposableEmails.slice(0, 20).map(vote => `
- **Email:** ${vote.email}
- **Project:** ${vote.projectId}
- **IP:** ${vote.ipAddress}
- **User Agent:** ${vote.userAgent}
- **Date:** ${new Date(vote.votedAt).toLocaleString()}
---`).join('\n')}

---

## 🌐 SUSPICIOUS IP ANALYSIS

### IPs with High Vote Counts (>10 votes)
${analysis.suspiciousIPs.slice(0, 20).map(ip => `
#### IP: ${ip.ip}
- **Vote Count:** ${ip.count}
- **Unique Emails:** ${new Set(ip.votes.map(v => v.email)).size}
- **Projects:** ${new Set(ip.votes.map(v => v.projectId)).size} different projects
- **User Agents:** ${new Set(ip.votes.map(v => v.userAgent)).size} different user agents
`).join('\n')}

---

## 📊 EMAIL DOMAIN DISTRIBUTION

### Top 20 Email Domains
${analysis.topDomains.map(([domain, count], index) => `${index + 1}. **${domain}:** ${count.toLocaleString()} votes`).join('\n')}

---

## 🤖 BOT ACTIVITY ANALYSIS

${analysis.botActivity.length === 0 ? '✅ **No explicit bot user agents detected**' : `
### Detected Bot Activities
${analysis.botActivity.slice(0, 10).map(vote => `
- **Email:** ${vote.email}
- **User Agent:** ${vote.userAgent}
- **IP:** ${vote.ipAddress}
- **Date:** ${new Date(vote.votedAt).toLocaleString()}
`).join('\n')}
`}

---

## 🚩 SUSPICIOUS PATTERNS SUMMARY

### Pattern Distribution
${Object.entries(patternDist).map(([pattern, count]) => `- **${pattern.replace(/_/g, ' ')}:** ${count.toLocaleString()} votes`).join('\n')}

---

## 🔍 DETAILED INVESTIGATION NEEDED

### High-Risk Indicators
1. **Disposable Emails:** ${analysis.disposableEmails.length.toLocaleString()} votes (${fraudPercentage}% of total)
2. **Suspicious IPs:** ${analysis.suspiciousIPs.length} IPs with >10 votes each
3. **Pattern Anomalies:** ${analysis.suspiciousPatterns.length.toLocaleString()} votes with suspicious patterns

### Recommended Actions
1. **Review all disposable email votes** - These may be fraudulent
2. **Investigate high-volume IPs** - Potential bot farms
3. **Cross-reference with registration data** - Verify legitimate users
4. **Implement stricter email validation** - Block known disposable domains

---

## 📈 VOTE INTEGRITY SCORE

Based on the analysis:
- **Legitimate Votes (estimated):** ${legitimateVotes.toLocaleString()} (${legitimatePercentage}%)
- **Potentially Fraudulent:** ${analysis.disposableEmails.length.toLocaleString()} (${fraudPercentage}%)

### Fraud Risk Level: ${riskLevel}

---

## 📋 SPECIFIC FINDINGS

### Critical Issues Found:
1. **${analysis.disposableEmails.length.toLocaleString()} votes from disposable email services** - High fraud risk
2. **${analysis.suspiciousIPs.length} IP addresses with excessive voting activity** - Potential bot networks
3. **${Object.keys(analysis.duplicateEmails).length} duplicate email addresses** - Policy violation

### Most Suspicious Activities:
${analysis.suspiciousIPs.slice(0, 5).map(ip => `
- **IP ${ip.ip}:** ${ip.count} votes from ${new Set(ip.votes.map(v => v.email)).size} different emails
`).join('')}

*End of Report*
`;

// Save the report
fs.writeFileSync('VOTE_FRAUD_ANALYSIS_REPORT.md', report);
console.log('📁 Report saved to VOTE_FRAUD_ANALYSIS_REPORT.md');
console.log(`📊 Analysis Summary:`);
console.log(`- Total votes: ${analysis.totalVotes.toLocaleString()}`);
console.log(`- Disposable emails: ${analysis.disposableEmails.length.toLocaleString()} (${fraudPercentage}%)`);
console.log(`- Suspicious IPs: ${analysis.suspiciousIPs.length}`);
console.log(`- Fraud risk level: ${riskLevel}`);