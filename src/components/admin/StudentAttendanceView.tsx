import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getAttendanceByChild } from '../../services/attendanceService';
import type { Attendance } from '../../types/index';

interface StudentAttendanceViewProps {
  childId: string;
  childName: string;
  admissionNumber?: string;
  onBack: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const pad = (n: number) => String(n).padStart(2, '0');

const STATUS_COLOR: Record<string, { bg: string; fg: string; label: string }> = {
  present: { bg: '#e8f5e9', fg: '#2e7d32', label: 'Present' },
  absent: { bg: '#ffebee', fg: '#c62828', label: 'Absent' },
  late: { bg: '#fff3e0', fg: '#ef6c00', label: 'Late' },
  'half-day': { bg: '#fff9c4', fg: '#9e7d00', label: 'Half day' },
};

const StudentAttendanceView = ({ childId, childName, admissionNumber, onBack }: StudentAttendanceViewProps) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const startDate = `${year}-${pad(month + 1)}-01`;
        const lastDay = new Date(year, month + 1, 0).getDate();
        const endDate = `${year}-${pad(month + 1)}-${pad(lastDay)}`;
        const data = await getAttendanceByChild(childId, startDate, endDate);
        setRecords(data);
      } catch (err) {
        console.error('Error loading student attendance:', err);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [childId, year, month]);

  const byDate = useMemo(() => {
    const map: Record<string, Attendance> = {};
    records.forEach(r => { map[r.date] = r; });
    return map;
  }, [records]);

  const stats = useMemo(() => {
    let present = 0, absent = 0, late = 0, halfDay = 0;
    records.forEach(r => {
      if (r.status === 'present') present++;
      else if (r.status === 'absent') absent++;
      else if (r.status === 'late') late++;
      else if (r.status === 'half-day') halfDay++;
    });
    const total = records.length;
    const attended = present + late + halfDay;
    const rate = total > 0 ? Math.round((attended / total) * 100) : 0;
    return { total, present, absent, late, halfDay, rate };
  }, [records]);

  const goPrevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); } else { setMonth(m => m - 1); }
  };
  const goNextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); } else { setMonth(m => m + 1); }
  };

  const downloadCSV = () => {
    const rows = ['Date,Status,Check-in Time'];
    const lastDay = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= lastDay; d++) {
      const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
      const rec = byDate[dateStr];
      rows.push(`${dateStr},${rec?.status || ''},${rec?.checkInTime || ''}`);
    }
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const slug = (admissionNumber || childName.replace(/\s+/g, '_')).toLowerCase();
    a.download = `attendance_${slug}_${year}-${pad(month + 1)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Build calendar grid: 7 columns. First column = Sunday.
  const firstOfMonth = new Date(year, month, 1);
  const leadingBlanks = firstOfMonth.getDay(); // 0 = Sunday
  const lastDay = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: lastDay }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div style={{ padding: '16px', maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px' }}>{childName}</h2>
          {admissionNumber && (
            <div style={{ color: '#1565c0', fontWeight: 600, fontSize: '13px', letterSpacing: '0.5px' }}>
              {admissionNumber}
            </div>
          )}
        </div>
      </div>

      {/* Month nav */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#f5f5f5', borderRadius: '12px', padding: '10px 14px', marginBottom: '16px',
      }}>
        <button onClick={goPrevMonth} style={{ background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={18} />
        </button>
        <div style={{ fontWeight: 600, fontSize: '16px' }}>
          {MONTH_NAMES[month]} {year}
        </div>
        <button onClick={goNextMonth} style={{ background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Summary stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px', marginBottom: '16px',
      }}>
        <StatCard label="Marked days" value={stats.total} color="#1565c0" />
        <StatCard label="Present" value={stats.present} color="#2e7d32" icon={<CheckCircle size={16} />} />
        <StatCard label="Absent" value={stats.absent} color="#c62828" icon={<XCircle size={16} />} />
        <StatCard label="Late" value={stats.late} color="#ef6c00" icon={<Clock size={16} />} />
        <StatCard label="Rate" value={`${stats.rate}%`} color="#00897B" />
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading attendance...</div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', padding: '12px', border: '1px solid #eee' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '6px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>
                {d}
              </div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
              {week.map((day, di) => {
                if (day === null) {
                  return <div key={di} style={{ aspectRatio: '1', background: 'transparent' }} />;
                }
                const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
                const rec = byDate[dateStr];
                const color = rec ? STATUS_COLOR[rec.status] : null;
                return (
                  <div
                    key={di}
                    title={rec ? `${dateStr} — ${color?.label}${rec.checkInTime ? ` @ ${rec.checkInTime}` : ''}` : dateStr}
                    style={{
                      aspectRatio: '1',
                      background: color?.bg || '#fafafa',
                      color: color?.fg || '#333',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 600,
                      border: '1px solid ' + (color ? color.bg : '#eee'),
                    }}
                  >
                    <div>{day}</div>
                    {color && (
                      <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>
                        {color.label.charAt(0)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '12px', fontSize: '12px' }}>
        {Object.entries(STATUS_COLOR).map(([key, v]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-block', width: '14px', height: '14px', background: v.bg, border: `1px solid ${v.fg}`, borderRadius: '4px' }} />
            <span style={{ color: '#555' }}>{v.label}</span>
          </div>
        ))}
      </div>

      {/* Export */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          onClick={downloadCSV}
          style={{
            background: '#00897B', color: 'white', border: 'none', borderRadius: '8px',
            padding: '10px 18px', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px',
          }}
        >
          <Download size={16} /> Download month as CSV
        </button>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color, icon }: { label: string; value: number | string; color: string; icon?: React.ReactNode }) => (
  <div style={{ background: 'white', border: '1px solid #eee', borderRadius: '10px', padding: '10px 12px', textAlign: 'center' }}>
    <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
      {icon}
      {label}
    </div>
    <div style={{ fontSize: '22px', fontWeight: 700, color }}>{value}</div>
  </div>
);

export default StudentAttendanceView;
