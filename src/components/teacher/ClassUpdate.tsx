import { useState } from 'react';
import { ChevronLeft, Send, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createClassUpdate } from '../../services/classUpdateService';
import './ClassUpdate.css';

interface ClassUpdateProps {
  onBack: () => void;
}

const classes = [
  { id: 'class-1', name: 'Sunshine Nursery' },
  { id: 'class-2', name: 'Rainbow LKG' },
  { id: 'class-3', name: 'Star UKG' },
];

const ClassUpdateForm = ({ onBack }: ClassUpdateProps) => {
  const { user } = useAuth();
  const [type, setType] = useState<'daily' | 'weekly'>('daily');
  const [classId, setClassId] = useState('class-2');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weekStart, setWeekStart] = useState('');
  const [weekEnd, setWeekEnd] = useState('');
  const [summary, setSummary] = useState('');
  const [activities, setActivities] = useState('');
  const [homework, setHomework] = useState('');
  const [reminders, setReminders] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async () => {
    if (!user || !summary.trim()) return;
    if (type === 'weekly' && (!weekStart || !weekEnd)) {
      alert('Pick both Week Start and Week End dates.');
      return;
    }

    setSaving(true);
    try {
      const cls = classes.find(c => c.id === classId);
      const payload: Parameters<typeof createClassUpdate>[0] = {
        classId,
        className: cls?.name || '',
        type,
        date,
        teacherId: user.id,
        teacherName: user.name,
        summary: summary.trim(),
        activities: activities.trim(),
        homework: homework.trim(),
        reminders: reminders.trim(),
        createdAt: new Date().toISOString(),
      };
      if (type === 'weekly') {
        payload.weekStart = weekStart;
        payload.weekEnd = weekEnd;
      }
      await createClassUpdate(payload);
      setSaved(true);
      setTimeout(() => onBack(), 2000);
    } catch (error) {
      console.error(error);
      alert('Failed to send update');
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="content">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #4CAF50, #45a049)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'white', fontSize: '48px' }}>✓</div>
          <h2>Update Sent!</h2>
          <p>All parents in the class have been notified.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}><ChevronLeft size={24} /></button>
        <h2 className="page-title">{type === 'daily' ? 'Daily' : 'Weekly'} Update</h2>
      </div>

      <div className="cu-form">
        {/* Type toggle */}
        <div className="cu-type-toggle">
          <button className={`cu-type-btn ${type === 'daily' ? 'active' : ''}`} onClick={() => setType('daily')}>
            Daily Update
          </button>
          <button className={`cu-type-btn ${type === 'weekly' ? 'active' : ''}`} onClick={() => setType('weekly')}>
            Weekly Update
          </button>
        </div>

        {/* Class */}
        <div className="cu-field">
          <label>Class</label>
          <select value={classId} onChange={e => setClassId(e.target.value)} className="cu-select">
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Date */}
        {type === 'daily' ? (
          <div className="cu-field">
            <label><Calendar size={14} /> Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="cu-input" />
          </div>
        ) : (
          <div className="cu-row">
            <div className="cu-field">
              <label>Week Start</label>
              <input type="date" value={weekStart} onChange={e => setWeekStart(e.target.value)} className="cu-input" />
            </div>
            <div className="cu-field">
              <label>Week End</label>
              <input type="date" value={weekEnd} onChange={e => setWeekEnd(e.target.value)} className="cu-input" />
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="cu-field">
          <label>What we did today {type === 'weekly' ? 'this week' : ''} *</label>
          <textarea value={summary} onChange={e => setSummary(e.target.value)} className="cu-textarea" rows={3}
            placeholder={type === 'daily' ? 'e.g. Today we learned about shapes and colors. Children did finger painting and sang nursery rhymes.' : 'e.g. This week we covered animals, shapes, and numbers 1-10. Children made animal masks and practiced writing.'} />
        </div>

        {/* Activities */}
        <div className="cu-field">
          <label>Activities & Learning</label>
          <textarea value={activities} onChange={e => setActivities(e.target.value)} className="cu-textarea" rows={2}
            placeholder="e.g. Circle time, art & craft, outdoor play, story time, number practice" />
        </div>

        {/* Homework */}
        <div className="cu-field">
          <label>Homework / Things to bring</label>
          <textarea value={homework} onChange={e => setHomework(e.target.value)} className="cu-textarea" rows={2}
            placeholder="e.g. Practice writing A-E in notebook. Bring crayons and old newspaper for tomorrow's craft." />
        </div>

        {/* Reminders */}
        <div className="cu-field">
          <label>Reminders / Notes</label>
          <textarea value={reminders} onChange={e => setReminders(e.target.value)} className="cu-textarea" rows={2}
            placeholder="e.g. Tomorrow is sports day, wear white uniform. Fee due date: April 10th." />
        </div>

        <button className="btn btn-primary btn-block" onClick={handleSubmit} disabled={saving || !summary.trim()}>
          {saving ? 'Sending...' : (
            <><Send size={18} /> Send to All Parents</>
          )}
        </button>
      </div>
    </div>
  );
};

export default ClassUpdateForm;
