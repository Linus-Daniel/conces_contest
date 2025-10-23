# Email Services

This project supports two email services:

## 1. Nodemailer (emailService.ts)
- Uses Gmail SMTP
- Requires `EMAIL_USER` and `EMAIL_PASSWORD` environment variables

## 2. Resend (resendService.ts) - **NEW**
- Modern email service with better deliverability
- Requires `RESEND_API_KEY` and `RESEND_FROM_EMAIL` environment variables

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# For Resend (recommended)
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL="CONCES Rebrand Challenge <noreply@yourdomain.com>"

# For Nodemailer (existing)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

## Getting Started with Resend

1. Sign up at [https://resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Set up your sender domain (or use the free resend.dev domain for testing)
4. Add the environment variables above

## Usage Examples

### Send Voting OTP Email
```typescript
import { sendVotingOTPEmailWithResend } from '@/lib/email/resendService';

const result = await sendVotingOTPEmailWithResend(
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
import { sendVotingStageEmailWithResend } from '@/lib/email/resendService';

const success = await sendVotingStageEmailWithResend({
  email: 'candidate@example.com',
  firstName: 'John'
});
```

### Send Voting Card Email
```typescript
import { sendVotingCardEmailWithResend } from '@/lib/email/resendService';

const success = await sendVotingCardEmailWithResend({
  email: 'candidate@example.com',
  firstName: 'John',
  candidateName: 'John Doe',
  projectTitle: 'Amazing Logo Design'
});
```

### Bulk Email Operations
```typescript
import { 
  sendVotingStageEmailsToQualifiedWithResend,
  sendVotingCardEmailsToSelectedWithResend 
} from '@/lib/email/resendService';

// Send voting stage emails to all qualified candidates
const result1 = await sendVotingStageEmailsToQualifiedWithResend({
  batchSize: 15,
  delayBetweenBatches: 2000
});

// Send voting card emails to selected contestants
const result2 = await sendVotingCardEmailsToSelectedWithResend({
  batchSize: 15,
  delayBetweenBatches: 2000,
  updateDatabase: true
});
```

## API Endpoints Updated

The following API endpoints now use Resend:

- `POST /api/vote/request-otp-email` - Sends OTP emails for voting
- `POST /api/users/emails/voting-stage-all` - Bulk voting stage emails
- `POST /api/users/emails/voting-cards` - Bulk voting card emails

## Benefits of Resend

- Better email deliverability
- Modern API design
- Built-in analytics
- No need for SMTP configuration
- Better error handling and logging