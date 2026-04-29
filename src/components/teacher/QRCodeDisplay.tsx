import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Printer, Lock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { subscribeAppSettings } from '../../services/settingsService';
import './QRCodeDisplay.css';

interface QRCodeDisplayProps {
  onBack: () => void;
}

const SCHOOL_CHECKIN_URL = 'https://school-c0203.web.app?action=checkin';

const QRCodeDisplay = ({ onBack }: QRCodeDisplayProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [qrEnabled, setQrEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const unsub = subscribeAppSettings(s => setQrEnabled(s.qrCheckInEnabled));
    return unsub;
  }, []);

  if (qrEnabled === false) {
    return (
      <div className="content">
        <div className="page-header">
          <button className="back-btn" onClick={onBack}><ChevronLeft size={24} /></button>
          <h2 className="page-title">QR Check-in</h2>
        </div>
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#666' }}>
          <Lock size={48} style={{ opacity: 0.4, marginBottom: 16 }} />
          <h3>QR check-in is disabled</h3>
          <p>Ask the admin to enable QR check-in from Settings.</p>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html><head><title>Mayuri Kids Villa - Check-in QR</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
        h1 { font-size: 32px; margin-bottom: 4px; color: #333; }
        h2 { font-size: 18px; color: #666; margin-bottom: 30px; font-weight: normal; }
        .qr-box { display: inline-block; border: 4px solid #333; border-radius: 16px; padding: 20px; margin-bottom: 24px; }
        .steps { text-align: left; max-width: 380px; margin: 0 auto; font-size: 16px; color: #444; }
        .steps li { margin-bottom: 10px; line-height: 1.4; }
        .footer { margin-top: 24px; font-size: 13px; color: #999; border-top: 1px solid #eee; padding-top: 16px; }
      </style></head><body>
      <img src="/images/logo.png" width="90" style="margin-bottom:8px" />
      <h1>Mayuri Kids Villa</h1>
      <h2>Daily Check-in / Check-out</h2>
      <div class="qr-box">
        ${printRef.current?.querySelector('.qr-code-box')?.innerHTML || ''}
      </div>
      <div class="steps">
        <strong>How to check in:</strong>
        <ol>
          <li>Open camera and <strong>scan this QR code</strong></li>
          <li>Login to the Mayuri app (if not already)</li>
          <li>Tap your child's name</li>
          <li>Tap <strong>Check In</strong> (morning) or <strong>Check Out</strong> (evening)</li>
        </ol>
      </div>
      <div class="footer">Scan every day at drop-off and pickup. Contact school admin for login help.</div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  return (
    <div className="content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="page-title">QR Check-in</h2>
      </div>

      <div className="qr-container" ref={printRef}>
        <div className="qr-code-wrapper">
          <div className="qr-code-box">
            <QRCodeSVG value={SCHOOL_CHECKIN_URL} size={260} level="H" includeMargin={true} />
          </div>
          <div className="qr-class-label">Mayuri Kids Villa</div>
          <div className="qr-timer static">
            <Printer size={16} />
            <span>Permanent — print and paste at entrance</span>
          </div>
        </div>

        <button className="qr-print-btn" onClick={handlePrint}>
          <Printer size={18} />
          <span>Print QR Code</span>
        </button>

        <div className="qr-instructions">
          <h4>How it works</h4>
          <ol>
            <li>Print this QR and paste at the <strong>school entrance</strong></li>
            <li>Parent scans with phone camera at <strong>drop-off</strong></li>
            <li>App opens → parent taps child → <strong>Check In</strong></li>
            <li>Child marked <strong>present</strong> with time — teacher gets notified</li>
            <li>At <strong>pickup</strong>, parent scans again → <strong>Check Out</strong></li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
