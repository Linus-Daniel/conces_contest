# Email Service Configuration

This project uses **Nodemailer with AWS SES SMTP** for reliable email delivery.

## Email Service Setup

### AWS SES SMTP Configuration
- Uses Amazon Simple Email Service (SES) for high deliverability
- SMTP endpoint: `email-smtp.eu-north-1.amazonaws.com`
- Port: 587 (TLS)
- Connection pooling enabled for better performance

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# AWS SES SMTP Configuration (Primary)
SMTP_HOST=email-smtp.eu-north-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=AKIAYKFQRCU7D7473264
SMTP_PASSWORD=BGxHfNMWawjdN4919KXOyCafMrRepN2qqHE83mXnHhip
SMTP_FROM="CONCES Rebrand Challenge <noreply@conces.org>"

# Optional fallback values are hardcoded in the service
```

## Email Service Features

- **High Deliverability**: AWS SES provides excellent inbox delivery rates
- **Rate Limiting**: 14 emails/second (AWS SES default limit)
- **Connection Pooling**: Up to 5 concurrent connections
- **Error Handling**: Comprehensive error logging and retry logic
- **Bulk Operations**: Batch processing for mass email campaigns

## Usage Examples

### Send Voting OTP Email
```typescript
import { sendVotingOTPEmail } from '@/lib/email/emailService';

const result = await sendVotingOTPEmail(
  'user@example.com',
  '123456',
  'Amazing Project Title'
);

if (result.success) {
  console.log('OTP email sent successfully');
} else {
  console.error('Failed to send OTP:', result.error);
}
```

### Send Voting Stage Email
```typescript
import { sendVotingStageEmail } from '@/lib/email/emailService';

const success = await sendVotingStageEmail({
  email: 'candidate@example.com',
  firstName: 'John'
});
```

### Send Voting Card Email
```typescript
import { sendVotingCardEmail } from '@/lib/email/emailService';

const success = await sendVotingCardEmail({
  email: 'candidate@example.com',
  firstName: 'John',
  candidateName: 'John Doe',
  projectTitle: 'Amazing Logo Design'
});
```

### Bulk Email Operations
```typescript
import { 
  sendVotingStageEmailsToQualified,
  sendVotingCardEmailsToSelected 
} from '@/lib/email/emailService';

// Send voting stage emails to all qualified candidates
const result1 = await sendVotingStageEmailsToQualified({
  batchSize: 15,
  delayBetweenBatches: 2000
});

// Send voting card emails to selected contestants
const result2 = await sendVotingCardEmailsToSelected({
  batchSize: 15,
  delayBetweenBatches: 2000,
  updateDatabase: true
});
```

## API Endpoints

The following API endpoints use the AWS SES email service:

- `POST /api/vote/request-otp-email` - Sends OTP emails for voting
- `POST /api/users/emails/voting-stage-all` - Bulk voting stage emails
- `POST /api/users/emails/voting-cards` - Bulk voting card emails

## AWS SES Benefits

- **High Deliverability**: Industry-leading inbox placement rates
- **Scalability**: Handle high-volume email campaigns
- **Cost-Effective**: Pay only for emails sent
- **Reliable**: 99.9% uptime SLA
- **Monitoring**: Built-in bounce and complaint handling
- **Security**: TLS encryption and AWS IAM integration

## Email Templates

All email templates include:
- Professional HTML formatting
- Plain text fallbacks
- Mobile-responsive design
- Brand consistency
- Security warnings for OTP emails

## Rate Limits & Performance

- **Sending Rate**: 14 emails/second
- **Connection Pool**: 5 concurrent connections
- **Batch Processing**: Automatic batching for bulk operations
- **Retry Logic**: Built-in error handling and retries
- **Monitoring**: Comprehensive logging for debugging

## Testing

Use the `testEmailConnection()` function to verify SMTP configuration:

```typescript
import { testEmailConnection } from '@/lib/email/emailService';

const isWorking = await testEmailConnection();
console.log('Email service status:', isWorking ? 'OK' : 'Failed');
```

## Configuration Files

The SMTP credentials are sourced from:
- **Environment variables** (`.env.local`)
- **SMTP CSV file** (`smtp.csv`) containing AWS SES credentials
- **Fallback values** hardcoded in the service for development

## Migration Notes

This service has been updated from Resend to AWS SES SMTP for:
- Better integration with existing AWS infrastructure
- Lower costs for high-volume email campaigns
- More control over email delivery and monitoring
- Compliance with enterprise email requirements