import { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { recordCheckIn, recordCheckOut, getTodayCheckInsForChild } from '../../services/qrService';
import type { Child, CheckInRecord } from '../../types/index';
import './QRScanner.css';

interface QRScannerProps {
  onBack: () => void;
  children: Child[];
}

interface ChildStatus {
  child: Child;
  records: CheckInRecord[];
  lastAction: 'check-in' | 'check-out' | null;
  checkInTime: string | null;
}

const QRCheckIn = ({ onBack, children: childrenProp }: QRScannerProps) => {
  const { user } = useAuth();
  const [childStatuses, setChildStatuses] = useState<ChildStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ childName: string; type: string } | null>(null);

  useEffect(() => {
    const loadStatuses = async () => {
      setLoading(true);
      const statuses: ChildStatus[] = [];
      for (const child of childrenProp) {
        const records = await getTodayCheckInsForChild(child.id);
        const sorted = records.sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        const lastAction = sorted[0]?.type || null;
        const checkInRecord = records.find(r => r.type === 'check-in');
        statuses.push({
          child,
          records,
          lastAction,
          checkInTime: checkInRecord ? new Date(checkInRecord.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : null,
        });
      }
      setChildStatuses(statuses);
      setLoading(false);
    };
    loadStatuses();
  }, [childrenProp]);

  const handleAction = async (child: Child, type: 'check-in' | 'check-out') => {
    if (!user) return;
    setProcessing(child.id);

    try {
      const data = {
        childId: child.id,
        parentId: user.id,
        classId: child.classId,
        type,
        timestamp: new Date().toISOString(),
        method: 'qr' as const,
      };

      if (type === 'check-in') {
        await recordCheckIn(data);
      } else {
        await recordCheckOut(data);
      }

      // Notify teacher
      try {
        const { createNotification } = await import('../../services/notificationService');
        const { getAllTeachers } = await import('../../services/teacherService');
        const teachers = await getAllTeachers();
        const action = type === 'check-in' ? 'checked in' : 'checked out';
        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        for (const teacher of teachers) {
          await createNotification(
            teacher.id,
            `${child.name} ${action}`,
            `${child.name} was ${action} at ${time} by ${user.name}`,
            'attendance'
          );
        }
      } catch { /* best effort */ }

      setSuccess({ childName: child.name, type });
      setTimeout(() => {
        setSuccess(null);
        // Refresh statuses
        const refresh = async () => {
          const records = await getTodayCheckInsForChild(child.id);
          const sorted = records.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          const checkInRecord = records.find(r => r.type === 'check-in');
          setChildStatuses(prev => prev.map(cs =>
            cs.child.id === child.id ? {
              ...cs,
              records,
              lastAction: sorted[0]?.type || null,
              checkInTime: checkInRecord ? new Date(checkInRecord.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : null,
            } : cs
          ));
        };
        refresh();
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setProcessing(null);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="content">
        <div className="success-container">
          <div className="success-icon"><CheckCircle size={64} /></div>
          <h2>{success.type === 'check-in' ? 'Checked In!' : 'Checked Out!'}</h2>
          <p>{success.childName} — {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
          <p style={{ color: '#999', fontSize: '13px', marginTop: '8px' }}>Teacher has been notified</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="page-title">Check In / Out</h2>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading...</div>
      ) : (
        <div className="checkin-list">
          <p className="checkin-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          {childStatuses.map(({ child, lastAction, checkInTime, records }) => {
            const isCheckedIn = lastAction === 'check-in';
            const nextAction = isCheckedIn ? 'check-out' : 'check-in';
            const isProcessing = processing === child.id;

            return (
              <div className="checkin-card" key={child.id}>
                <div className="checkin-child-info">
                  <div className="checkin-avatar">{child.gender === 'male' ? '👦' : '👧'}</div>
                  <div>
                    <div className="checkin-child-name">{child.name}</div>
                    <div className="checkin-class">
                      {child.classId === 'class-1' ? 'Nursery' : child.classId === 'class-2' ? 'LKG' : 'UKG'}
                    </div>
                  </div>
                  {isCheckedIn && (
                    <div className="checkin-status-badge present">
                      Present since {checkInTime}
                    </div>
                  )}
                  {!isCheckedIn && lastAction === 'check-out' && (
                    <div className="checkin-status-badge left">
                      Checked out
                    </div>
                  )}
                </div>

                {/* Today's timeline */}
                {records.length > 0 && (
                  <div className="checkin-timeline">
                    {records.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map((r, i) => (
                      <span className="checkin-timeline-item" key={i}>
                        {r.type === 'check-in' ? '🟢' : '🔴'}{' '}
                        {r.type === 'check-in' ? 'In' : 'Out'}{' '}
                        {new Date(r.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  className={`checkin-btn ${nextAction === 'check-in' ? 'btn-checkin' : 'btn-checkout'}`}
                  onClick={() => handleAction(child, nextAction)}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : (
                    <>
                      {nextAction === 'check-in' ? <LogIn size={20} /> : <LogOut size={20} />}
                      <span>{nextAction === 'check-in' ? 'Check In' : 'Check Out'}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QRCheckIn;
