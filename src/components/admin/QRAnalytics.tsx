import { useEffect, useState } from 'react';
import { ChevronLeft, QrCode, RefreshCw, LogIn, LogOut, Lock, Unlock } from 'lucide-react';
import { getAllCheckInsInRange } from '../../services/qrService';
import { getAppSettings, updateAppSettings, subscribeAppSettings } from '../../services/settingsService';
import type { CheckInRecord } from '../../types/index';

interface Props { onBack: () => void }

type Range = 'today' | 'week' | 'month';

const rangeToDates = (range: Range) => {
  const end = new Date();
  const start = new Date();
  if (range === 'week') start.setDate(start.getDate() - 6);
  else if (range === 'month') start.setMonth(start.getMonth() - 1);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
};

const QRAnalytics = ({ onBack }: Props) => {
  const [range, setRange] = useState<Range>('today');
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrEnabled, setQrEnabled] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    getAppSettings().then(s => setQrEnabled(s.qrCheckInEnabled));
    const unsub = subscribeAppSettings(s => setQrEnabled(s.qrCheckInEnabled));
    return unsub;
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { start, end } = rangeToDates(range);
      const data = await getAllCheckInsInRange(start, end);
      setRecords(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [range]);

  const toggleQR = async () => {
    setToggling(true);
    try {
      await updateAppSettings({ qrCheckInEnabled: !qrEnabled });
    } catch {
      alert('Failed to update setting');
    } finally {
      setToggling(false);
    }
  };

  const checkIns = records.filter(r => r.type === 'check-in');
  const checkOuts = records.filter(r => r.type === 'check-out');
  const uniqueChildren = new Set(records.map(r => r.childId)).size;

  // Group by day
  const byDay = new Map<string, { in: number; out: number }>();
  records.forEach(r => {
    const day = r.timestamp.split('T')[0];
    const cur = byDay.get(day) || { in: 0, out: 0 };
    if (r.type === 'check-in') cur.in++;
    else cur.out++;
    byDay.set(day, cur);
  });
  const dailyRows = Array.from(byDay.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}><ChevronLeft size={24} /></button>
        <h2 className="page-title">QR Check-in</h2>
        <button className="refresh-btn" onClick={load} disabled={loading} style={{ marginLeft: 'auto' }}>
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
        </button>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
          padding: 14, marginBottom: 16
        }}>
          <div>
            <strong style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {qrEnabled ? <Unlock size={16} /> : <Lock size={16} />}
              QR check-in is {qrEnabled ? 'ON' : 'OFF'}
            </strong>
            <small style={{ color: '#64748b' }}>
              {qrEnabled ? 'Parents can scan, teachers can view the QR.' : 'Teachers and parents see a disabled message.'}
            </small>
          </div>
          <button
            onClick={toggleQR}
            disabled={toggling}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: 'none',
              background: qrEnabled ? '#ef4444' : '#10b981',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {qrEnabled ? 'Disable' : 'Enable'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['today', 'week', 'month'] as Range[]).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: range === r ? '#2563eb' : 'white',
                color: range === r ? 'white' : '#334155',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {r === 'today' ? 'Today' : r === 'week' ? 'Last 7 days' : 'Last 30 days'}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
          <div style={{ background: '#eff6ff', padding: 14, borderRadius: 10 }}>
            <div style={{ color: '#1e40af', fontSize: 12 }}><LogIn size={14} /> Check-ins</div>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{checkIns.length}</div>
          </div>
          <div style={{ background: '#f0fdf4', padding: 14, borderRadius: 10 }}>
            <div style={{ color: '#166534', fontSize: 12 }}><LogOut size={14} /> Check-outs</div>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{checkOuts.length}</div>
          </div>
          <div style={{ background: '#fef3c7', padding: 14, borderRadius: 10 }}>
            <div style={{ color: '#92400e', fontSize: 12 }}><QrCode size={14} /> Unique kids</div>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{uniqueChildren}</div>
          </div>
        </div>

        <h4 style={{ margin: '16px 0 8px' }}>By day</h4>
        {loading ? (
          <p>Loading…</p>
        ) : dailyRows.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No check-ins in this range.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {dailyRows.map(([day, counts]) => (
              <div key={day} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '10px 14px', background: 'white',
                border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14
              }}>
                <span>{day}</span>
                <span style={{ color: '#64748b' }}>
                  In: <strong style={{ color: '#1e40af' }}>{counts.in}</strong>
                  {'  '}·{'  '}
                  Out: <strong style={{ color: '#166534' }}>{counts.out}</strong>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QRAnalytics;
