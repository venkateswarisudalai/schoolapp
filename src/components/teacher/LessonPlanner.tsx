import { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Trash2, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  createLessonPlan,
  getLessonPlansByTeacher,
  deleteLessonPlan,
} from '../../services/lessonPlanService';
import type { LessonPlan, PlannedActivity } from '../../types/index';
import './LessonPlanner.css';

interface LessonPlannerProps {
  onBack: () => void;
}

const activityTypes: PlannedActivity['type'][] = [
  'circle-time', 'art', 'music', 'outdoor', 'sensory', 'story', 'free-play', 'learning'
];

const CLASS_OPTIONS = [
  { id: 'nursery', name: 'Nursery' },
  { id: 'lkg', name: 'LKG' },
  { id: 'ukg', name: 'UKG' },
];

const LessonPlanner = ({ onBack }: LessonPlannerProps) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [viewPlan, setViewPlan] = useState<LessonPlan | null>(null);

  // Form state
  const [classId, setClassId] = useState(CLASS_OPTIONS[0].id);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [theme, setTheme] = useState('');
  const [objectives, setObjectives] = useState('');
  const [materials, setMaterials] = useState('');
  const [notes, setNotes] = useState('');
  const [activities, setActivities] = useState<PlannedActivity[]>([
    { time: '09:00', duration: 15, name: '', description: '', type: 'circle-time', skills: [] }
  ]);

  useEffect(() => {
    if (!user) return;
    const loadPlans = async () => {
      setLoading(true);
      try {
        const data = await getLessonPlansByTeacher(user.id);
        setPlans(data);
      } catch (error) {
        console.error('Error loading lesson plans:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, [user]);

  const addActivity = () => {
    const lastAct = activities[activities.length - 1];
    const lastMinutes = parseInt(lastAct.time.split(':')[0]) * 60 + parseInt(lastAct.time.split(':')[1]) + lastAct.duration;
    const nextHour = Math.floor(lastMinutes / 60).toString().padStart(2, '0');
    const nextMin = (lastMinutes % 60).toString().padStart(2, '0');
    setActivities([...activities, {
      time: `${nextHour}:${nextMin}`,
      duration: 15,
      name: '',
      description: '',
      type: 'learning',
      skills: []
    }]);
  };

  const removeActivity = (idx: number) => {
    if (activities.length <= 1) return;
    setActivities(activities.filter((_, i) => i !== idx));
  };

  const updateActivity = (idx: number, field: string, value: unknown) => {
    setActivities(activities.map((a, i) => i === idx ? { ...a, [field]: value } : a));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !theme || !classId) return;

    setSaving(true);
    try {
      const planData = {
        teacherId: user.id,
        classId,
        date,
        theme,
        objectives: objectives.split('\n').filter(o => o.trim()),
        activities: activities.filter(a => a.name.trim()),
        materials: materials.split(',').map(m => m.trim()).filter(m => m),
        notes: notes || undefined,
      };

      const id = await createLessonPlan(planData);
      setPlans([{ id, ...planData } as LessonPlan, ...plans]);
      setShowCreate(false);
      resetForm();
    } catch (error) {
      console.error('Error creating lesson plan:', error);
      alert('Failed to create lesson plan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setTheme('');
    setObjectives('');
    setMaterials('');
    setNotes('');
    setActivities([{ time: '09:00', duration: 15, name: '', description: '', type: 'circle-time', skills: [] }]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lesson plan?')) return;
    try {
      await deleteLessonPlan(id);
      setPlans(plans.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting lesson plan:', error);
      alert('Failed to delete lesson plan.');
    }
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'circle-time': return '🔵';
      case 'art': return '🎨';
      case 'music': return '🎵';
      case 'outdoor': return '🌳';
      case 'sensory': return '🧩';
      case 'story': return '📖';
      case 'free-play': return '🎮';
      case 'learning': return '📚';
      default: return '📝';
    }
  };

  const getClassName = (id: string) => CLASS_OPTIONS.find(c => c.id === id)?.name || id;

  // View plan detail
  if (viewPlan) {
    return (
      <div className="content">
        <div className="page-header">
          <button className="back-btn" onClick={() => setViewPlan(null)}>
            <ChevronLeft size={24} />
          </button>
          <h2 className="page-title">Lesson Plan</h2>
        </div>

        <div className="plan-detail-card">
          <h3>{viewPlan.theme}</h3>
          <p className="plan-detail-meta">
            {getClassName(viewPlan.classId)} | {new Date(viewPlan.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>

          {viewPlan.objectives.length > 0 && (
            <div className="plan-section">
              <h4>Objectives</h4>
              <ul>
                {viewPlan.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
              </ul>
            </div>
          )}

          <div className="plan-section">
            <h4>Activities</h4>
            <div className="plan-timeline">
              {viewPlan.activities.map((act, i) => (
                <div className="plan-timeline-item" key={i}>
                  <div className="plan-timeline-time">{act.time}</div>
                  <div className="plan-timeline-content">
                    <div className="plan-timeline-title">
                      {getTypeEmoji(act.type)} {act.name}
                    </div>
                    <div className="plan-timeline-desc">{act.description}</div>
                    <div className="plan-timeline-tags">
                      <span className="plan-duration">{act.duration} min</span>
                      {act.skills.map((s, j) => <span key={j} className="lesson-tag">{s}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {viewPlan.materials.length > 0 && (
            <div className="plan-section">
              <h4>Materials</h4>
              <div className="materials-list">
                {viewPlan.materials.map((m, i) => <span key={i} className="material-tag">{m}</span>)}
              </div>
            </div>
          )}

          {viewPlan.notes && (
            <div className="plan-section">
              <h4>Notes</h4>
              <p>{viewPlan.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Create form
  if (showCreate) {
    return (
      <div className="content">
        <div className="page-header">
          <button className="back-btn" onClick={() => setShowCreate(false)}>
            <ChevronLeft size={24} />
          </button>
          <h2 className="page-title">Create Lesson Plan</h2>
        </div>

        <form onSubmit={handleCreate} className="assignment-form">
          <div className="form-group">
            <label>Theme *</label>
            <input type="text" value={theme} onChange={e => setTheme(e.target.value)} placeholder="e.g., Colors and Shapes" required />
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Class</label>
              <select value={classId} onChange={e => setClassId(e.target.value)}>
                {CLASS_OPTIONS.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Objectives (one per line)</label>
            <textarea value={objectives} onChange={e => setObjectives(e.target.value)} rows={3} placeholder="Identify primary colors&#10;Recognize basic shapes" />
          </div>

          <div className="form-group">
            <label>Activities</label>
            {activities.map((act, idx) => (
              <div key={idx} className="activity-entry">
                <div className="activity-entry-header">
                  <input type="time" value={act.time} onChange={e => updateActivity(idx, 'time', e.target.value)} style={{ width: '100px' }} />
                  <input type="number" value={act.duration} onChange={e => updateActivity(idx, 'duration', parseInt(e.target.value))} style={{ width: '60px' }} placeholder="min" />
                  <select value={act.type} onChange={e => updateActivity(idx, 'type', e.target.value)} style={{ flex: 1 }}>
                    {activityTypes.map(t => <option key={t} value={t}>{t.replace('-', ' ')}</option>)}
                  </select>
                  <button type="button" onClick={() => removeActivity(idx)} className="icon-btn-sm">
                    <Trash2 size={16} />
                  </button>
                </div>
                <input type="text" value={act.name} onChange={e => updateActivity(idx, 'name', e.target.value)} placeholder="Activity name" />
                <input type="text" value={act.description} onChange={e => updateActivity(idx, 'description', e.target.value)} placeholder="Description" />
              </div>
            ))}
            <button type="button" onClick={addActivity} className="btn-add-activity">
              <Plus size={16} /> Add Activity
            </button>
          </div>

          <div className="form-group">
            <label>Materials (comma separated)</label>
            <input type="text" value={materials} onChange={e => setMaterials(e.target.value)} placeholder="Color cards, Crayons, Paper" />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Any additional notes..." />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
            {saving ? 'Creating...' : 'Create Lesson Plan'}
          </button>
        </form>
      </div>
    );
  }

  // Plan list
  return (
    <div className="content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="page-title">Lesson Planner</h2>
      </div>

      <div style={{ padding: '0 16px 12px' }}>
        <button className="btn btn-primary btn-block" onClick={() => setShowCreate(true)}>
          <Plus size={18} style={{ marginRight: 8 }} />
          Create New Plan
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          Loading lesson plans...
        </div>
      ) : plans.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} />
          <h3>No Lesson Plans</h3>
          <p>Create your first lesson plan</p>
        </div>
      ) : (
        <div style={{ padding: '0 16px' }}>
          {plans.map(plan => (
            <div className="plan-card" key={plan.id} onClick={() => setViewPlan(plan)}>
              <div className="plan-card-header">
                <div>
                  <h4>{plan.theme}</h4>
                  <p>{getClassName(plan.classId)} | {new Date(plan.date).toLocaleDateString()}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(plan.id); }} className="icon-btn-sm">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="plan-card-activities">
                {plan.activities.slice(0, 3).map((act, i) => (
                  <span key={i} className="plan-activity-chip">
                    {getTypeEmoji(act.type)} {act.name}
                  </span>
                ))}
                {plan.activities.length > 3 && (
                  <span className="plan-activity-chip more">+{plan.activities.length - 3} more</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LessonPlanner;
