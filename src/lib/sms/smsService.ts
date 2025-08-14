// bulkSmsService.ts

interface BulkSMSProvider {
  sendBulkSMS(
    phoneNumbers: string[],
    message: string,
    options?: {
      senderId?: string;
      scheduled?: Date;
      personalize?: boolean;
    }
  ): Promise<{
    success: boolean;
    results: {
      phoneNumber: string;
      messageId?: string;
      status: "success" | "failed";
      error?: string;
    }[];
    totalSent: number;
    totalFailed: number;
    error?: string;
  }>;

  sendSingleSMS(
    phoneNumber: string,
    message: string,
    options?: { senderId?: string }
  ): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

// BulkSMSNigeria.com Implementation
class BulkSMSNigeriaProvider implements BulkSMSProvider {
  private apiKey: string;
  private senderId: string;

  constructor() {
    this.apiKey = process.env.BULKSMSNIGERIA_API_KEY!;
    this.senderId = process.env.BULKSMSNIGERIA_SENDER_ID || "BULK";
  }

  async sendBulkSMS(
    phoneNumbers: string[],
    message: string,
    options?: {
      senderId?: string;
      scheduled?: Date;
      personalize?: boolean;
    }
  ) {
    try {
      const axios = require("axios");

      // Format phone numbers for BulkSMSNigeria
      const formattedNumbers = phoneNumbers.map((phone) =>
        phone.replace("+234", "234").replace("+", "")
      );

      const response = await axios.post(
        "https://www.bulksmsnigeria.com/api/v1/sms/create",
        {
          api_token: this.apiKey,
          from: options?.senderId || this.senderId,
          to: formattedNumbers.join(","),
          body: message,
          dnd: "2", // Handle DND numbers
        },
        {
          timeout: 15000,
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("BulkSMSNigeria response:", response.data);

      const results = phoneNumbers.map((phone, index) => ({
        phoneNumber: phone,
        messageId:
          response.data.data?.message_id || `bulk_${Date.now()}_${index}`,
        status:
          response.data.status === "success"
            ? ("success" as const)
            : ("failed" as const),
        error:
          response.data.status !== "success"
            ? response.data.message
            : undefined,
      }));

      const totalSent =
        response.data.status === "success" ? phoneNumbers.length : 0;
      const totalFailed =
        response.data.status !== "success" ? phoneNumbers.length : 0;

      return {
        success: response.data.status === "success",
        results,
        totalSent,
        totalFailed,
      };
    } catch (error: any) {
      console.error(
        "BulkSMSNigeria error:",
        error.response?.data || error.message
      );

      return {
        success: false,
        results: phoneNumbers.map((phone) => ({
          phoneNumber: phone,
          messageId:message,
          status: "failed" as const,
          error:
            error.response?.data?.message ||
            error.message ||
            "Failed to send SMS",
        })),
        totalSent: 0,
        totalFailed: phoneNumbers.length,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to send bulk SMS",
      };
    }
  }

  async sendSingleSMS(
    phoneNumber: string,
    message: string,
    options?: { senderId?: string }
  ) {
    const result = await this.sendBulkSMS([phoneNumber], message, options);
    const singleResult = result.results[0];

    return {
      success: singleResult.status === "success",
      messageId: singleResult.messageId,
      error: singleResult.error,
    };
  }
}

// Mock provider for development
class MockBulkProvider implements BulkSMSProvider {
  async sendBulkSMS(
    phoneNumbers: string[],
    message: string,
    options?: {
      senderId?: string;
      scheduled?: Date;
      personalize?: boolean;
    }
  ) {
    console.log(`[DEV] Mock Bulk SMS to ${phoneNumbers.length} numbers:`);
    console.log(`Message: ${message}`);
    console.log(`Sender: ${options?.senderId || "MOCK"}`);

    // Simulate some failures for testing
    const results = phoneNumbers.map((phone, index) => {
      const shouldFail = Math.random() < 0.1; // 10% failure rate
      return {
        phoneNumber: phone,
        messageId: shouldFail ? undefined : `mock_${Date.now()}_${index}`,
        status: shouldFail ? ("failed" as const) : ("success" as const),
        error: shouldFail ? "Mock SMS failure for testing" : undefined,
      };
    });

    const totalSent = results.filter((r) => r.status === "success").length;
    const totalFailed = results.filter((r) => r.status === "failed").length;

    return {
      success: totalSent > 0,
      results,
      totalSent,
      totalFailed,
    };
  }

  async sendSingleSMS(
    phoneNumber: string,
    message: string,
    options?: { senderId?: string }
  ) {
    const result = await this.sendBulkSMS([phoneNumber], message, options);
    const singleResult = result.results[0];

    return {
      success: singleResult.status === "success",
      messageId: singleResult.messageId,
      error: singleResult.error,
    };
  }
}

// Simplified Bulk SMS service with BulkSMSNigeria only
class BulkSMSService {
  private provider: BulkSMSProvider;

  constructor() {
    if (
      process.env.NODE_ENV === "development" &&
      process.env.USE_MOCK_SMS === "true"
    ) {
      this.provider = new MockBulkProvider();
      return;
    }

    // Use BulkSMSNigeria as the only provider
    if (!process.env.BULKSMSNIGERIA_API_KEY) {
      throw new Error("BULKSMSNIGERIA_API_KEY is required");
    }

    this.provider = new BulkSMSNigeriaProvider();
    console.log("Bulk SMS Service initialized with BulkSMSNigeria provider");
  }

  async sendBulkSMS(
    phoneNumbers: string[],
    message: string,
    options?: {
      senderId?: string;
      scheduled?: Date;
      personalize?: boolean;
      validateNumbers?: boolean;
    }
  ) {
    // Validate phone numbers if requested
    let validNumbers = phoneNumbers;
    const invalidNumbers: string[] = [];

    if (options?.validateNumbers !== false) {
      const validationResults = phoneNumbers.map((phone) => ({
        phone,
        ...validateNigerianPhone(phone),
      }));

      validNumbers = validationResults
        .filter((result) => result.isValid)
        .map((result) => result.formatted!);

      invalidNumbers.push(
        ...validationResults
          .filter((result) => !result.isValid)
          .map((result) => result.phone)
      );

      if (invalidNumbers.length > 0) {
        console.warn(
          `${invalidNumbers.length} invalid phone numbers excluded:`,
          invalidNumbers
        );
      }
    }

    if (validNumbers.length === 0) {
      return {
        success: false,
        results: phoneNumbers.map((phone) => ({
          phoneNumber: phone,
          messageId:message,
          status: "failed" as const,
          error: "Invalid phone number format",
        })),
        totalSent: 0,
        totalFailed: phoneNumbers.length,
        error: "No valid phone numbers to send to",
        provider: "validation",
        invalidNumbers,
      };
    }

    console.log(
      `Sending bulk SMS to ${validNumbers.length} numbers via BulkSMSNigeria...`
    );
    const result = await this.provider.sendBulkSMS(
      validNumbers,
      message,
      options
    );

    return {
      ...result,
      provider: "bulksmsnigeria",
      invalidNumbers,
    };
  }

  async sendSingleSMS(
    phoneNumber: string,
    message: string,
    options?: { senderId?: string; validateNumber?: boolean }
  ) {
    const result = await this.sendBulkSMS([phoneNumber], message, options);
    const singleResult = result.results[0];

    return {
      success: singleResult.status === "success",
      messageId: singleResult.messageId,
      error: singleResult.error,
      provider: result.provider,
    };
  }

  // Utility method to send personalized messages
  async sendPersonalizedBulkSMS(
    recipients: { phoneNumber: string; message: string; name?: string }[],
    options?: { senderId?: string; validateNumbers?: boolean }
  ) {
    console.log(
      `Sending personalized bulk SMS to ${recipients.length} recipients...`
    );

    const results = [];
    let totalSent = 0;
    let totalFailed = 0;

    // Group by message to optimize API calls
    const messageGroups = new Map<string, string[]>();
    recipients.forEach((recipient) => {
      const message = recipient.message;
      if (!messageGroups.has(message)) {
        messageGroups.set(message, []);
      }
      messageGroups.get(message)!.push(recipient.phoneNumber);
    });

    // Send each group
    for (const [message, phoneNumbers] of messageGroups) {
      const groupResult = await this.sendBulkSMS(
        phoneNumbers,
        message,
        options
      );
      results.push(...groupResult.results);
      totalSent += groupResult.totalSent;
      totalFailed += groupResult.totalFailed;
    }

    return {
      success: totalSent > 0,
      results,
      totalSent,
      totalFailed,
      groups: messageGroups.size,
    };
  }
}

// Singleton instance
let bulkSmsServiceInstance: BulkSMSService | null = null;

export function getBulkSMSProvider(): BulkSMSService {
  if (!bulkSmsServiceInstance) {
    bulkSmsServiceInstance = new BulkSMSService();
  }
  return bulkSmsServiceInstance;
}

// Phone number utility functions
export function formatAfricanPhone(
  phone: string,
  defaultCountryCode: string = "234"
): string {
  if (!phone || typeof phone !== "string") {
    throw new Error("Invalid phone number input");
  }

  let cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("234")) {
    if (cleaned.length === 13) return "+" + cleaned;
  } else if (cleaned.startsWith("254")) {
    if (cleaned.length === 12) return "+" + cleaned;
  } else if (cleaned.startsWith("256")) {
    if (cleaned.length === 12) return "+" + cleaned;
  } else if (cleaned.startsWith("255")) {
    if (cleaned.length === 12) return "+" + cleaned;
  } else if (cleaned.startsWith("0")) {
    return "+" + defaultCountryCode + cleaned.substring(1);
  } else if (cleaned.length === 9 || cleaned.length === 10) {
    return "+" + defaultCountryCode + cleaned;
  }

  return phone.startsWith("+") ? phone : "+" + phone;
}

export const formatNigerianPhone = (phone: string) =>
  formatAfricanPhone(phone, "234");

export function isNigerianNumber(phoneNumber: string): boolean {
  const cleaned = phoneNumber.replace(/\D/g, "");
  return (
    cleaned.startsWith("234") ||
    (cleaned.startsWith("0") && cleaned.length === 11) ||
    (cleaned.length === 10 && /^[789]/.test(cleaned))
  );
}

export function validateNigerianPhone(phoneNumber: string): {
  isValid: boolean;
  formatted?: string;
  error?: string;
  carrier?: string;
  country?: string;
} {
  if (!phoneNumber || typeof phoneNumber !== "string") {
    return { isValid: false, error: "Phone number is required" };
  }

  try {
    const formatted = formatNigerianPhone(phoneNumber);
    const cleaned = formatted.replace(/\D/g, "");

    if (!cleaned.startsWith("234")) {
      return {
        isValid: false,
        error: "Only Nigerian phone numbers are supported in this version",
      };
    }

    const mobilePrefix = cleaned.substring(3, 6);
    const validPrefixes = [
      "803",
      "806",
      "813",
      "816",
      "903",
      "906",
      "913",
      "916", // MTN
      "802",
      "808",
      "812",
      "902",
      "907",
      "912",
      "901", // Airtel
      "805",
      "807",
      "811",
      "815",
      "905",
      "915", // Glo
      "809",
      "817",
      "818",
      "909",
      "919", // 9mobile
    ];

    if (!validPrefixes.includes(mobilePrefix)) {
      return {
        isValid: false,
        error: "Invalid Nigerian mobile number prefix",
      };
    }

    let carrier = "Unknown";
    if (
      ["803", "806", "813", "816", "903", "906", "913", "916"].includes(
        mobilePrefix
      )
    ) {
      carrier = "MTN";
    } else if (
      ["802", "808", "812", "902", "907", "912", "901"].includes(mobilePrefix)
    ) {
      carrier = "Airtel";
    } else if (
      ["805", "807", "811", "815", "905", "915"].includes(mobilePrefix)
    ) {
      carrier = "Glo";
    } else if (["809", "817", "818", "909", "919"].includes(mobilePrefix)) {
      carrier = "9mobile";
    }

    return {
      isValid: true,
      formatted,
      carrier,
      country: "Nigeria",
    };
  } catch (error: any) {
    return {
      isValid: false,
      error: error.message || "Invalid phone number format",
    };
  }
}
