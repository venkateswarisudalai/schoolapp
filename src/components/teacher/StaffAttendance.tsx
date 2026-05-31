import { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle, LogIn, LogOut, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  recordStaffAttendance,
  getTodayStaffRecordsForTeacher,
} from '../../services/staffAttendanceService';
import type { StaffAttendanceRecord } from '../../types/index';

interface Props {
  onBack: () => void;
}

// Teacher self check-in / check-out. Reached by scanning the entrance QR
// (?action=teacher-attendance) or via the "My Attendance" quick action.
const StaffAttendance = ({ onBack }: Props) => {
  const { user } = useAuth();
  const [records, setRecords] = useState<StaffAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState<{ type: 'check-in' | 'check-out'; time: string } | null>(null);

  const loadStatus = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const recs = await getTodayStaffRecordsForTeacher(user.id);
      setRecords(recs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Sorted oldest-first already; the latest action decides what's next.
  const lastAction = records.length ? records[records.length - 1].type : null;
  const nextAction: 'check-in' | 'check-out' = lastAction === 'check-in' ? 'check-out' : 'check-in';
  const checkInRecord = records.find(r => r.type === 'check-in');

  const handleAction = async (type: 'check-in' | 'check-out') => {
    if (!user || processing) return;
    setProcessing(true);
    try {
      const saved = await recordStaffAttendance({
        teacherId: user.id,
        teacherName: user.name || user.email,
        teacherEmail: user.email,
        type,
        method: 'qr',
      });
      setSuccess({ type, time: saved.istTime });
      setTimeout(() => {
        setSuccess(null);
        loadStatus();
      }, 2200);
    } catch (error) {
      console.error('Error recording staff attendance:', error);
      alert('Could not save your attendance. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="content">
        <div style={{ textAlign: 'center', padding: '70px 20px' }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%', margin: '0 auto 24px',
            background: success.type === 'check-in'
              ? 'linear-gradient(135deg,#4CAF50,#388E3C)'
              : 'linear-gradient(135deg,#FF9800,#F57C00)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
          }}>
            <CheckCircle size={56} />
          </div>
          <h2 style={{ margin: '0 0 6px' }}>
            {success.type === 'check-in' ? 'Checked In!' : 'Checked Out!'}
          </h2>
          <p style={{ color: '#555', fontSize: 16, margin: 0 }}>
            {user?.name || user?.email}
          </p>
          <p style={{ color: '#00897B', fontSize: 18, fontWeight: 700, marginTop: 8 }}>
            {success.time} IST
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}><ChevronLeft size={24} /></button>
        <h2 className="page-title">My Attendance</h2>
      </div>

      <div style={{ padding: 16 }}>
        <p style={{ color: '#666', fontSize: 14, margin: '0 0 16px' }}>
          {new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          }).format(new Date())}
        </p>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Loading…</div>
        ) : (
          <>
            {/* Current status */}
            <div style={{
              background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12,
              padding: 18, marginBottom: 18, textAlign: 'center',
            }}>
              {lastAction === 'check-in' && (
                <div style={{ color: '#388E3C', fontWeight: 700, fontSize: 16 }}>
                  ✅ Present since {checkInRecord?.istTime} IST
                </div>
              )}
              {lastAction === 'check-out' && (
                <div style={{ color: '#F57C00', fontWeight: 700, fontSize: 16 }}>
                  👋 Checked out for the day
                </div>
              )}
              {!lastAction && (
                <div style={{ color: '#64748b', fontWeight: 600, fontSize: 15 }}>
                  Not checked in yet today
                </div>
              )}
            </div>

            {/* Action button */}
            <button
              className="btn btn-primary btn-block"
              onClick={() => handleAction(nextAction)}
              disabled={processing}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                fontSize: 17, padding: '16px',
                background: nextAction === 'check-in'
                  ? 'linear-gradient(135deg,#4CAF50,#388E3C)'
                  : 'linear-gradient(135deg,#FF9800,#F57C00)',
              }}
            >
              {processing ? 'Saving…' : (
                <>
                  {nextAction === 'check-in' ? <LogIn size={22} /> : <LogOut size={22} />}
                  <span>{nextAction === 'check-in' ? 'Check In' : 'Check Out'}</span>
                </>
              )}
            </button>

            {/* Today's timeline */}
            {records.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h4 style={{ margin: '0 0 10px', color: '#334155' }}>Today</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {records.map(r => (
                    <div key={r.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', background: 'white',
                      border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14,
                    }}>
                      {r.type === 'check-in'
                        ? <LogIn size={16} color="#388E3C" />
                        : <LogOut size={16} color="#F57C00" />}
                      <span style={{ fontWeight: 600 }}>
                        {r.type === 'check-in' ? 'Check In' : 'Check Out'}
                      </span>
                      <span style={{ marginLeft: 'auto', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={14} /> {r.istTime} IST
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StaffAttendance;
