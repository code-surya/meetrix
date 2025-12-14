import { useState, useRef, useEffect } from 'react';
import { Event } from '@/features/events/eventsTypes';
import { useQrScanner } from '@/hooks/useQrScanner';
import { Loading } from '@/components/common/Loading/Loading';
import './QrScanner.css';

interface QrScannerProps {
  event: Event;
  onScan: (qrData: string) => void;
  onManualCheckIn: (bookingItemId: number, qrData: string) => void;
}

const QrScanner = ({ event, onScan, onManualCheckIn }: QrScannerProps) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanMode, setScanMode] = useState<'auto' | 'manual'>('auto');
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const {
    isScanning,
    isSupported,
    startScanning,
    stopScanning,
    lastScan,
    error,
    videoRef,
  } = useQrScanner();

  useEffect(() => {
    if (lastScan) {
      onScan(lastScan);
    }
  }, [lastScan, onScan]);

  useEffect(() => {
    // Request camera permission on mount
    const requestPermission = async () => {
      try {
        const permissionGranted = await navigator.mediaDevices.getUserMedia({ video: true });
        permissionGranted.getTracks().forEach(track => track.stop());
        setHasPermission(true);
      } catch (err) {
        setHasPermission(false);
      }
    };

    if (isSupported) {
      requestPermission();
    }
  }, [isSupported]);

  const handleStartScanning = async () => {
    if (!hasPermission) {
      alert('Camera permission is required for QR scanning');
      return;
    }

    try {
      await startScanning();
    } catch (err: any) {
      console.error('Failed to start scanning:', err);
    }
  };

  const handleStopScanning = () => {
    stopScanning();
  };

  const handleManualScan = () => {
    const qrData = prompt('Enter QR code data:');
    if (qrData) {
      onScan(qrData);
    }
  };

  if (!isSupported) {
    return (
      <div className="qr-scanner-unsupported">
        <div className="unsupported-content">
          <h3>Camera Not Supported</h3>
          <p>Your device doesn't support camera access for QR scanning.</p>
          <button className="btn-secondary" onClick={handleManualScan}>
            Manual Entry
          </button>
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="qr-scanner-no-permission">
        <div className="no-permission-content">
          <h3>Camera Access Required</h3>
          <p>Please allow camera access to scan QR codes.</p>
          <p>You can also use manual entry below.</p>
          <button className="btn-secondary" onClick={handleManualScan}>
            Manual Entry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="qr-scanner">
      <div className="scanner-header">
        <h3>QR Code Scanner</h3>
        <div className="scan-mode-toggle">
          <button
            className={`mode-btn ${scanMode === 'auto' ? 'active' : ''}`}
            onClick={() => setScanMode('auto')}
          >
            Auto Scan
          </button>
          <button
            className={`mode-btn ${scanMode === 'manual' ? 'active' : ''}`}
            onClick={() => setScanMode('manual')}
          >
            Manual
          </button>
        </div>
      </div>

      <div className="scanner-content">
        {scanMode === 'auto' ? (
          <div className="camera-section">
            <div className="video-container" ref={videoContainerRef}>
              <video
                ref={videoRef}
                className="scanner-video"
                playsInline
                muted
                style={{ display: isScanning ? 'block' : 'none' }}
              />

              {!isScanning && (
                <div className="scanner-placeholder">
                  <div className="placeholder-content">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <p>Camera ready for scanning</p>
                  </div>
                </div>
              )}
            </div>

            <div className="scanner-controls">
              {!isScanning ? (
                <button className="btn-primary" onClick={handleStartScanning}>
                  Start Scanning
                </button>
              ) : (
                <button className="btn-secondary" onClick={handleStopScanning}>
                  Stop Scanning
                </button>
              )}

              <button className="btn-secondary" onClick={handleManualScan}>
                Manual Entry
              </button>
            </div>

            {error && (
              <div className="scanner-error">
                <p>Error: {error}</p>
              </div>
            )}

            {isScanning && (
              <div className="scanning-indicator">
                <Loading size="small" />
                <span>Scanning for QR codes...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="manual-section">
            <div className="manual-content">
              <h4>Manual QR Code Entry</h4>
              <p>Enter the QR code data manually or paste it here:</p>
              <button className="btn-primary" onClick={handleManualScan}>
                Enter QR Code
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="scanner-instructions">
        <h4>How to use:</h4>
        <ul>
          <li>Position the QR code within the camera view</li>
          <li>Ensure good lighting for better scanning</li>
          <li>Hold the device steady while scanning</li>
          <li>The app will automatically check in the attendee</li>
        </ul>
      </div>
    </div>
  );
};

export default QrScanner;

