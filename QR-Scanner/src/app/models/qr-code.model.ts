export interface QrCode {
  id?: string;
  data: string;
  timestamp: Date;
  type: QrCodeType;
  isValidUrl?: boolean;
}

export enum QrCodeType {
  TEXT = 'text',
  URL = 'url',
  CONTACT = 'contact',
  WIFI = 'wifi',
  EMAIL = 'email',
  SMS = 'sms',
  CALENDAR = 'calendar',
  GEOLOCATION = 'geolocation',
}

export interface QrScanResult {
  success: boolean;
  data?: string;
  error?: string;
  type?: QrCodeType;
  isValidUrl?: boolean;
}
