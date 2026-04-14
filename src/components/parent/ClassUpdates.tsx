import { useState, useEffect } from 'react';
import { ChevronLeft, BookOpen, Calendar, ClipboardList, Bell } from 'lucide-react';
import { getClassUpdates } from '../../services/classUpdateService';
import type { ClassUpdate } from '../../services/classUpdateService';
import type { Child } from '../../types/index';
import './ClassUpdates.css';

interface ClassUpdatesProps {
  onBack: () => void;
  children: Child[];
}

const ClassUpdatesView = ({ onBack, children: childrenProp }: ClassUpdatesProps) => {
  const [updates, setUpdates] = useState<ClassUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const allUpdates: ClassUpdate[] = [];
      const classIds = [...new Set(childrenProp.map(c => c.classId))];
      for (const cid of classIds) {
        const u = await getClassUpdates(cid);
        allUpdates.push(...u);
      }
      allUpdates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUpdates(allUpdates);
      setLoading(false);
    };
    load();
  }, [childrenProp]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch { return dateStr; }
  };

  return (
    <div className="content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}><ChevronLeft size={24} /></button>
        <h2 className="page-title">Class Updates</h2>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading...</div>
      ) : updates.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#999' }}>
          <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h3 style={{ color: '#666' }}>No updates yet</h3>
          <p>Class updates from teachers will appear here.</p>
        </div>
      ) : (
        <div className="clu-list">
          {updates.map(u => (
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

export default ClassUpdatesView;
