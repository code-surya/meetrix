import { useState, useRef, useCallback, useEffect } from 'react';
import qrScanner from '@/services/qrScanner';

interface UseQrScannerReturn {
  isScanning: boolean;
  isSupported: boolean;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
  lastScan: string | null;
  error: string | null;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const useQrScanner = (): UseQrScannerReturn => {
  const [isScanning, setIsScanning] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check if camera is supported
    const checkSupport = async () => {
      const supported = !!(
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia &&
        window.MediaStream
      );
      setIsSupported(supported);
    };

    checkSupport();

    return () => {
      // Cleanup on unmount
      stopScanning();
    };
  }, []);

  const startScanning = useCallback(async () => {
    if (!videoRef.current || !isSupported) {
      setError('Camera not supported');
      return;
    }

    setError(null);
    setLastScan(null);

    try {
      await qrScanner.startScanning(
        videoRef.current,
        (result) => {
          setLastScan(result);
          // Auto-stop after successful scan
          stopScanning();
        },
        (scanError) => {
          setError(scanError);
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      setError(err.message);
    }
  }, [isSupported]);

  const stopScanning = useCallback(() => {
    qrScanner.stopScanning();
    setIsScanning(false);
    setError(null);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return {
    isScanning,
    isSupported,
    startScanning,
    stopScanning,
    lastScan,
    error,
    videoRef,
  };
};

