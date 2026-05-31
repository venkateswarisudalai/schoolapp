import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, RefreshCw, Printer, Users, LogIn, LogOut } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getStaffRecordsInRange, istDateKey, istDateLabel } from '../../services/staffAttendanceService';
import type { StaffAttendanceRecord } from '../../types/index';

interface Props { onBack: () => void }

type Range = 'today' | 'week' | 'month';

// Teachers scan this QR at the staff entrance. The phone's camera opens the
// app, which (after login) routes to "My Attendance" via ?action=teacher-attendance.
const STAFF_QR_URL = 'https://school-c0203.web.app?action=teacher-attendance';

// Builds the start IST date for a range, ending today (IST).
const rangeStartDate = (range: Range): string => {
  const d = new Date();
  if (range === 'week') d.setDate(d.getDate() - 6);
  else if (range === 'month') d.setDate(d.getDate() - 29);
  return istDateKey(d);
};

interface TeacherDaySummary {
  teacherId: string;
  teacherName: string;
  firstIn: StaffAttendanceRecord | null;
  lastOut: StaffAttendanceRecord | null;
}

const StaffAttendance = ({ onBack }: Props) => {
  const [range, setRange] = useState<Range>('today');
  const [records, setRecords] = useState<StaffAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getStaffRecordsInRange(rangeStartDate(range), istDateKey());
      setRecords(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [range]);

  // Group records by IST day, then summarise each teacher's first check-in /
  // last check-out for that day.
  const byDay = new Map<string, StaffAttendanceRecord[]>();
  records.forEach(r => {
    const arr = byDay.get(r.istDate) || [];
    arr.push(r);
    byDay.set(r.istDate, arr);
  });
  const days = Array.from(byDay.keys()).sort((a, b) => b.localeCompare(a)); // newest first

  const summariseDay = (dayRecords: StaffAttendanceRecord[]): TeacherDaySummary[] => {
    const byTeacher = new Map<string, StaffAttendanceRecord[]>();
    dayRecords.forEach(r => {
      const arr = byTeacher.get(r.teacherId) || [];
      arr.push(r);
      byTeacher.set(r.teacherId, arr);
    });
    return Array.from(byTeacher.values()).map(recs => {
      const sorted = [...recs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const ins = sorted.filter(r => r.type === 'check-in');
      const outs = sorted.filter(r => r.type === 'check-out');
      return {
        teacherId: sorted[0].teacherId,
        teacherName: sorted[0].teacherName,
        firstIn: ins[0] || null,
        lastOut: outs[outs.length - 1] || null,
      };
    }).sort((a, b) => a.teacherName.localeCompare(b.teacherName));
  };

  const todayKey = istDateKey();
  const presentToday = new Set(
    records.filter(r => r.istDate === todayKey && r.type === 'check-in').map(r => r.teacherId)
  ).size;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Mayuri Kids Villa - Staff Check-in QR</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
        h1 { font-size: 32px; margin-bottom: 4px; color: #333; }
        h2 { font-size: 18px; color: #666; margin-bottom: 30px; font-weight: normal; }
        .qr-box { display: inline-block; border: 4px solid #333; border-radius: 16px; padding: 20px; margin-bottom: 24px; }
        .steps { text-align: left; max-width: 380px; margin: 0 auto; font-size: 16px; color: #444; }
        .steps li { margin-bottom: 10px; line-height: 1.4; }
        .footer { margin-top: 24px; font-size: 13px; color: #999; border-top: 1px solid #eee; padding-top: 16px; }
      </style></head><body>
      <h1>Mayuri Kids Villa</h1>
      <h2>Staff Attendance — scan on arrival & before leaving</h2>
      <div class="qr-box">${printRef.current?.querySelector('svg')?.outerHTML || ''}</div>
      <div class="steps">
        <strong>For teachers:</strong>
        <ol>
          <li>Open your phone camera and <strong>scan this QR code</strong></li>
          <li>Login to the Mayuri app (if not already)</li>
          <li>Tap <strong>Check In</strong> when you arrive</li>
          <li>Tap <strong>Check Out</strong> before you leave</li>
        </ol>
      </div>
      <div class="footer">Your check-in time is recorded in IST. Contact admin for login help.</div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  return (
    <div className="content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}><ChevronLeft size={24} /></button>
        <h2 className="page-title">Staff Attendance</h2>
        <button className="refresh-btn" onClick={load} disabled={loading} style={{ marginLeft: 'auto' }}>
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
        </button>
      </div>

      <div style={{ padding: 16 }}>
        {/* Today summary */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: '#eff6ff', borderRadius: 12, padding: 16, marginBottom: 16,
        }}>
          <Users size={28} color="#1e40af" />
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{presentToday}</div>
            <div style={{ color: '#1e40af', fontSize: 13 }}>staff checked in today</div>
          </div>
        </div>

        {/* Printable QR (collapsible) */}
        <button
          onClick={() => setShowQR(v => !v)}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 10, marginBottom: 16,
            border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600,
          }}
        >
          <Printer size={18} /> {showQR ? 'Hide' : 'Show'} entrance QR code
        </button>

        {showQR && (
          <div ref={printRef} style={{
            textAlign: 'center', background: 'white', border: '1px solid #e2e8f0',
            borderRadius: 12, padding: 20, marginBottom: 16,
          }}>
            <QRCodeSVG value={STAFF_QR_URL} size={220} level="H" includeMargin={true} />
            <p style={{ color: '#64748b', fontSize: 13, margin: '12px 0' }}>
              Print and paste at the staff entrance. Teachers scan it to check in / out.
            </p>
            <button className="btn btn-primary" onClick={handlePrint}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Printer size={18} /> Print QR
            </button>
          </div>
        )}

        {/* Range selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['today', 'week', 'month'] as Range[]).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
                background: range === r ? '#2563eb' : 'white',
                color: range === r ? 'white' : '#334155',
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              {r === 'today' ? 'Today' : r === 'week' ? 'Last 7 days' : 'Last 30 days'}
            </button>
          ))}
        </div>

        {/* Daily log */}
        {loading ? (
          <p style={{ color: '#64748b' }}>Loading…</p>
        ) : days.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No staff check-ins in this range yet.</p>
        ) : (
          days.map(day => {
            const summaries = summariseDay(byDay.get(day)!);
            return (
              <div key={day} style={{ marginBottom: 20 }}>
                <h4 style={{ margin: '0 0 8px', color: '#334155' }}>{istDateLabel(day)}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {summaries.map(s => (
                    <div key={s.teacherId} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', background: 'white',
                      border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14,
                    }}>
                      <span style={{ fontWeight: 600, flex: 1 }}>{s.teacherName}</span>
                      <span style={{ color: '#388E3C', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <LogIn size={14} /> {s.firstIn ? s.firstIn.istTime : '—'}
                      </span>
                      <span style={{ color: '#F57C00', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <LogOut size={14} /> {s.lastOut ? s.lastOut.istTime : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StaffAttendance;
