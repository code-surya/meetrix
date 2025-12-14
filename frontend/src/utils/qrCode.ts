// Simple QR Code utility for the MVP
// In a real app, you'd use a proper QR code library

export const generateQRCodeData = (bookingId: number): string => {
  // Generate a simple QR code data string
  // In production, this would be a proper QR code with encrypted data
  return `MEETRIX-BOOKING-${bookingId}-${Date.now()}`;
};

export const generateBookingId = (): string => {
  return `BK${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
};

export const validateQRCode = (qrData: string): { valid: boolean; bookingId?: number } => {
  // Simple validation - in production, this would decrypt and verify
  const match = qrData.match(/MEETRIX-BOOKING-(\d+)-/);
  if (match) {
    return { valid: true, bookingId: parseInt(match[1]) };
  }
  return { valid: false };
};

