import { useState, useEffect } from 'react';
import { ChevronLeft, BookOpen, Calendar, ClipboardList, Bell } from 'lucide-react';
import { getAllClassUpdates } from '../../services/classUpdateService';
import type { ClassUpdate } from '../../services/classUpdateService';
import '../parent/ClassUpdates.css';

interface ClassUpdatesProps {
  onBack: () => void;
}

const ClassUpdates = ({ onBack }: ClassUpdatesProps) => {
  const [updates, setUpdates] = useState<ClassUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState<string>('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getAllClassUpdates();
      setUpdates(data);
      setLoading(false);
    };
    load();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch { return dateStr; }
  };

  const classOptions = ['all', ...Array.from(new Set(updates.map(u => u.className).filter(Boolean)))];
  const visibleUpdates = filterClass === 'all' ? updates : updates.filter(u => u.className === filterClass);

  return (
    <div className="content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}><ChevronLeft size={24} /></button>
        <h2 className="page-title">Class Updates</h2>
      </div>

      {!loading && updates.length > 0 && (
        <div style={{ padding: '8px 16px' }}>
          <select
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}
          >
            {classOptions.map(c => (
              <option key={c} value={c}>{c === 'all' ? 'All classes' : c}</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading...</div>
      ) : visibleUpdates.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#999' }}>
          <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h3 style={{ color: '#666' }}>No updates yet</h3>
          <p>Class updates from teachers will appear here.</p>
        </div>
      ) : (
        <div className="clu-list">
          {visibleUpdates.map(u => (
            <div className="clu-card" key={u.id}>
              <div className="clu-header">
                <div>
                  <span className={`clu-type-badge ${u.type}`}>{u.type === 'daily' ? 'Daily' : 'Weekly'}</span>
                  <span className="clu-class-name">{u.className}</span>
                </div>
                <span className="clu-date">
                  <Calendar size={12} />
                  {u.type === 'weekly' && u.weekStart ? `${formatDate(u.weekStart)} - ${formatDate(u.weekEnd || '')}` : formatDate(u.date)}
                </span>
              </div>

              <div className="clu-section">
                <div className="clu-section-title"><BookOpen size={14} /> What we did</div>
                <p>{u.summary}</p>
              </div>

              {u.activities && (
                <div className="clu-section">
                  <div className="clu-section-title"><ClipboardList size={14} /> Activities</div>
                  <p>{u.activities}</p>
                </div>
              )}

              {u.homework && (
                <div className="clu-section homework">
                  <div className="clu-section-title">📝 Homework / Bring</div>
                  <p>{u.homework}</p>
                </div>
              )}

              {u.reminders && (
                <div className="clu-section reminder">
                  <div className="clu-section-title"><Bell size={14} /> Reminders</div>
                  <p>{u.reminders}</p>
                </div>
              )}

              <div className="clu-footer">
                <span>By {u.teacherName}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassUpdates;
