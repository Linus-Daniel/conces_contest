import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_CONFIG = {
  SERVICE_ID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_conces',
  TEMPLATE_ID: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_otp',
  PUBLIC_KEY: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '',
};

// Initialize EmailJS
if (typeof window !== 'undefined' && EMAILJS_CONFIG.PUBLIC_KEY) {
  emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
}

export interface EmailOTPResult {
  success: boolean;
  message: string;
  error?: string;
}

export async function sendEmailOTP(
  userEmail: string,
  otpCode: string,
  projectTitle: string
): Promise<EmailOTPResult> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('EmailJS can only be used in browser environment');
    }

    if (!EMAILJS_CONFIG.PUBLIC_KEY) {
      throw new Error('EmailJS public key not configured');
    }

    const templateParams = {
      to_email: userEmail,
      to_name: userEmail.split('@')[0],
      otp_code: otpCode,
      project_title: projectTitle,
      expiry_time: '5 minutes',
      company_name: 'CONCES',
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    if (response.status === 200) {
      return {
        success: true,
        message: 'OTP sent successfully to your email',
      };
    } else {
      throw new Error(`Failed to send email: ${response.text}`);
    }
  } catch (error) {
    console.error('Email OTP Error:', error);
    return {
      success: false,
      message: 'Failed to send OTP email',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Generate 6-digit OTP code
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Validate email format
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate Nigerian phone number
export function validateNigerianPhone(phone: string): boolean {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if it's a valid Nigerian number
  // Format: +234XXXXXXXXX, 234XXXXXXXXX, 0XXXXXXXXX, or XXXXXXXXX
  if (cleanPhone.length === 13 && cleanPhone.startsWith('234')) {
    return true;
  }
  if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
    return true;
  }
  if (cleanPhone.length === 10 && !cleanPhone.startsWith('0')) {
    return true;
  }
  
  return false;
}

// Normalize phone number to consistent format
export function normalizePhoneNumber(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.startsWith('234')) {
    return '+' + cleanPhone;
  }
  if (cleanPhone.startsWith('0')) {
    return '+234' + cleanPhone.slice(1);
  }
  if (cleanPhone.length === 10) {
    return '+234' + cleanPhone;
  }
  
  return phone; // Return original if can't normalize
}