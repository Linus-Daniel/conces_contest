// Enhanced email validation to block disposable email services
const DISPOSABLE_EMAIL_DOMAINS = [
  // Common disposable email services
  'guerrillamailblock.com',
  'guerrillamail.com',
  'guerrillamail.de',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.biz',
  'guerrillamail.info',
  'sharklasers.com',
  'grr.la',
  'guerrillamailblock.com',
  'pokemail.net',
  'spam4.me',
  'mailinator.com',
  'tempmail.org',
  '10minutemail.com',
  'throwaway.email',
  'maildrop.cc',
  'yopmail.com',
  'mailnesia.com',
  'temp-mail.org',
  'diohope@23.com',
  'dispostable.com',
  'fakeinbox.com',
  'mohmal.com',
  'mytrashmail.com',
  'tempinbox.com',
  'emailondeck.com',
  'emailfake.com',
  'spamgourmet.com',
  'mailcatch.com',
  'trashmail.ws',
  'incognitomail.org',
  'anonymbox.com',
  'trbvm.com',
  'getnada.com',
  'temp-mail.io',
  'tempmail.ninja',
  'tempmailo.com',
  'cs.email',
  'kzccv.com',
  'emlhub.com',
  'emltmp.com',
  'rxnbox.com',
  'gufum.com',
  'irabote.com',
  'psnc.oo2.org',
  'tmail.ws',
  'tmpnator.live',
  'tmpeml.info',
  'vomoto.com'
];

export function isDisposableEmail(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1];
  return DISPOSABLE_EMAIL_DOMAINS.includes(domain);
}

export function validateEmailDomain(email: string): { valid: boolean; reason?: string } {
  if (!email || !email.includes('@')) {
    return { valid: false, reason: 'Invalid email format' };
  }

  const domain = email.toLowerCase().split('@')[1];
  
  if (isDisposableEmail(email)) {
    return { 
      valid: false, 
      reason: `Disposable email addresses from ${domain} are not allowed. Please use a legitimate email address.` 
    };
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /^[a-z]{8}@/, // 8 random lowercase letters (common pattern)
    /^\w{6,10}@guerrilla/, // guerrilla mail patterns
    /^test\d*@/,
    /^temp\d*@/,
    /^fake\d*@/,
    /^spam\d*@/,
    /^trash\d*@/,
    /^\d{10,}@/, // all numbers
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(email.toLowerCase())) {
      return { 
        valid: false, 
        reason: 'Suspicious email pattern detected. Please use a legitimate email address.' 
      };
    }
  }

  return { valid: true };
}

// Phone number fraud detection
export function detectPhoneNumberFraud(phoneNumbers: string[]): boolean {
  // Check for sequential phone numbers (common fraud pattern)
  const numbers = phoneNumbers.map(p => parseInt(p.replace(/\D/g, '')));
  
  for (let i = 0; i < numbers.length - 1; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      const diff = Math.abs(numbers[i] - numbers[j]);
      // If numbers are very close (within 1000), it's suspicious
      if (diff < 1000 && diff > 0) {
        return true;
      }
    }
  }
  
  return false;
}