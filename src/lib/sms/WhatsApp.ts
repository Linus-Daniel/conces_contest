

// WhatsApp Business API Integration
export class WhatsAppService {
  private accessToken: string;
  private phoneNumberId: string;
  private businessAccountId: string;

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN!;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID!;
  }

  async sendOTP(
    phoneNumber: string,
    code: string,
    candidateName?: string
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      const message = candidateName
        ? `Your voting code for ${candidateName}: ${code}\n\nThis code expires in 5 minutes. Reply with this code to confirm your vote.`
        : `Your voting verification code: ${code}\n\nThis code expires in 5 minutes.`;

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: phoneNumber.replace("+", ""),
            type: "text",
            text: {
              body: message,
            },
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.messages) {
        return {
          success: true,
          messageId: result.messages[0].id,
        };
      } else {
        return {
          success: false,
          error: result.error?.message || "Failed to send WhatsApp message",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "WhatsApp service error",
      };
    }
  }

  async sendVoteConfirmation(
    phoneNumber: string,
    candidateName: string,
    voteId: string
  ): Promise<boolean> {
    try {
      const message = `✅ Vote Confirmed!\n\nYour vote for ${candidateName} has been successfully recorded.\n\nVote ID: ${voteId}\nTime: ${new Date().toLocaleString()}\n\nThank you for participating!`;

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: phoneNumber.replace("+", ""),
            type: "text",
            text: {
              body: message,
            },
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error("Failed to send confirmation:", error);
      return false;
    }
  }
}

// Simplified Vote model with embedded OTP
interface VoteDocument {
  phoneNumberHash: string;
  candidateId: string;
  candidateName: string;
  projectId: string;
  otp: {
    code: string;
    expiresAt: Date;
    attempts: number;
    used: boolean;
  };
  status: "pending" | "confirmed" | "expired";
  createdAt: Date;
  confirmedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Rate limiting - one vote attempt per phone per project per day
const rateLimitStore = new Map<
  string,
  { timestamp: number; attempts: number }
>();

export function checkDailyVoteLimit(
  phoneNumber: string,
  projectId: string
): {
  allowed: boolean;
  retryAfter?: number;
} {
  const key = `${phoneNumber}-${projectId}`;
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;

  const entry = rateLimitStore.get(key);

  if (!entry || now - entry.timestamp > dayInMs) {
    rateLimitStore.set(key, { timestamp: now, attempts: 1 });
    return { allowed: true };
  }

  // Allow only one vote attempt per day per project
  if (entry.attempts >= 1) {
    const retryAfter = Math.ceil((dayInMs - (now - entry.timestamp)) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.attempts++;
  return { allowed: true };
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
