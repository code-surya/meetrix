import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

export class QrScannerService {
  private codeReader: BrowserMultiFormatReader;
  private isScanning = false;
  private videoElement: HTMLVideoElement | null = null;

  constructor() {
    this.codeReader = new BrowserMultiFormatReader();
  }

  async startScanning(
    videoElement: HTMLVideoElement,
    onScanSuccess: (result: string) => void,
    onScanError?: (error: string) => void
  ): Promise<void> {
    if (this.isScanning) {
      throw new Error('Scanner is already running');
    }

    this.videoElement = videoElement;
    this.isScanning = true;

    try {
      const constraints = {
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.srcObject = stream;

      await videoElement.play();

      // Start continuous scanning
      this.codeReader.decodeFromVideoDevice(
        undefined,
        videoElement,
        (result, error) => {
          if (result && !error) {
            onScanSuccess(result.getText());
          } else if (error && !(error instanceof NotFoundException)) {
            onScanError?.(error.message);
          }
        }
      );
    } catch (error: any) {
      this.isScanning = false;
      throw new Error(`Failed to start camera: ${error.message}`);
    }
  }

  stopScanning(): void {
    if (!this.isScanning) return;

    this.isScanning = false;

    try {
      this.codeReader.reset();
    } catch (error) {
      console.error('Error stopping scanner:', error);
    }

    if (this.videoElement && this.videoElement.srcObject) {
      const stream = this.videoElement.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      this.videoElement.srcObject = null;
    }
  }

  isActive(): boolean {
    return this.isScanning;
  }

  async getAvailableCameras(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Error getting cameras:', error);
      return [];
    }
  }

  // Request camera permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      return false;
    }
  }
}

// Singleton instance
export const qrScanner = new QrScannerService();
export default qrScanner;

