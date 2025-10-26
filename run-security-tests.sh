#!/bin/bash

# Security Testing Automation Script
# This script runs comprehensive security validation tests

set -e

echo "🔒 VOTING PLATFORM SECURITY VALIDATION"
echo "======================================"

# Configuration
PROJECT_ID="${1:-68e3f0f493d1f4da4ef4ae01}"  # Use provided project ID or default
TEST_URL="${TEST_URL:-http://localhost:3000}"
REPORT_DIR="security-reports"

# Create reports directory
mkdir -p "$REPORT_DIR"

echo "Configuration:"
echo "  Project ID: $PROJECT_ID"
echo "  Test URL: $TEST_URL"
echo "  Reports: $REPORT_DIR"
echo ""

# Function to run a test and capture results
run_test() {
    local test_name="$1"
    local description="$2"
    
    echo "🧪 Running $description..."
    
    # Run the test and capture output
    if node security-test-framework.js "$test_name" "$PROJECT_ID" > "$REPORT_DIR/${test_name}-$(date +%Y%m%d_%H%M%S).log" 2>&1; then
        echo "✅ $description completed successfully"
    else
        echo "❌ $description failed - check logs in $REPORT_DIR"
        return 1
    fi
    
    echo ""
}

# Pre-flight checks
echo "🔍 Pre-flight security checks..."

# Check if the application is running
if ! curl -s "$TEST_URL/api/health" > /dev/null 2>&1; then
    echo "⚠️  Warning: Application may not be running at $TEST_URL"
    echo "   Make sure your voting platform is accessible before running tests"
    echo ""
fi

# Check for existing security measures
if [ -f "src/lib/antiBot.ts" ]; then
    echo "✅ Anti-bot protection detected"
else
    echo "❌ Anti-bot protection not found"
fi

if [ -f "src/lib/emailValidator.ts" ]; then
    echo "✅ Email validation detected"
else
    echo "❌ Email validation not found"
fi

if [ -f "src/lib/ipSecurity.ts" ]; then
    echo "✅ IP security detected"
else
    echo "❌ IP security not found"
fi

echo ""

# Run security validation tests
echo "🚀 Starting security validation tests..."
echo ""

# Test 1: Bot Detection
run_test "bot-detection" "Bot Detection & User-Agent Filtering"

# Wait between tests to avoid overwhelming the system
sleep 2

# Test 2: Rate Limiting
run_test "rate-limiting" "Rate Limiting & Rapid Request Protection"

sleep 2

# Test 3: Email Validation
run_test "email-validation" "Email Validation & Disposable Email Blocking"

sleep 2

# Test 4: IP Security
run_test "ip-security" "IP Security & Access Control"

sleep 2

# Test 5: Comprehensive Test Suite
echo "🔬 Running comprehensive security test suite..."
if node security-test-framework.js all "$PROJECT_ID" > "$REPORT_DIR/comprehensive-$(date +%Y%m%d_%H%M%S).log" 2>&1; then
    echo "✅ Comprehensive security tests completed"
else
    echo "❌ Comprehensive tests failed - check logs"
fi

echo ""

# Generate summary report
echo "📊 Generating security validation summary..."

# Count test results
total_tests=$(find "$REPORT_DIR" -name "*$(date +%Y%m%d)*.log" | wc -l)
echo "Total test runs: $total_tests"

# Find the latest comprehensive report
latest_report=$(find . -name "security-test-report-*.json" -type f -exec ls -t {} + | head -n1)

if [ -n "$latest_report" ]; then
    echo "📋 Latest comprehensive report: $latest_report"
    
    # Extract key metrics from the report
    if command -v jq >/dev/null 2>&1; then
        echo ""
        echo "🛡️ Security Status Summary:"
        jq -r '.securityStatus | to_entries[] | "  \(.key | gsub("(?<=[a-z])(?=[A-Z])"; " ") | ascii_upcase): \(if .value then "✅ ACTIVE" else "❌ INACTIVE" end)"' "$latest_report"
        
        recommendations=$(jq -r '.recommendations[]?' "$latest_report" 2>/dev/null)
        if [ -n "$recommendations" ]; then
            echo ""
            echo "💡 Recommendations:"
            echo "$recommendations" | sed 's/^/  - /'
        fi
    fi
else
    echo "📋 Report generated: $latest_report"
    echo "   Install 'jq' for detailed summary parsing"
fi

echo ""
echo "🏁 Security validation completed!"
echo ""
echo "📁 All test logs and reports are available in: $REPORT_DIR"
echo "📋 Review the comprehensive report for detailed findings"
echo ""
echo "Next steps:"
echo "1. Review all generated reports"
echo "2. Address any failed security tests"
echo "3. Monitor application logs for blocked attacks"
echo "4. Schedule regular security validation runs"
echo ""
echo "For questions or issues, check the security-test-scenarios.md documentation"