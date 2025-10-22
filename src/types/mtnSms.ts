export interface SMSFormData {
  phoneNumbers: string;
  message: string;
  senderId: string;
}

export interface SMSResponse {
  success: boolean;
  data?: any;
  messageId?: string;
  status?: string;
  error?: string;
  statusCode?: number;
}

export interface UseMTNSMSReturn {
  sendSMS: (
    to: string | string[],
    message: string,
    senderId?: string
  ) => Promise<SMSResponse>;
  sendBulkSMS: (
    numbers: string[],
    message: string,
    senderId?: string
  ) => Promise<SMSResponse>;
  loading: boolean;
  error: string | null;
  result: SMSResponse | null;
  clearState: () => void;
}
