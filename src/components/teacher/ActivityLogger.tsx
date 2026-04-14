import { useState } from 'react';
import { ChevronLeft, Plus, Trash2, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createActivity } from '../../services/activityService';
import type { Child, MealLog, NapLog, ActivityLog } from '../../types/index';
import './ActivityLogger.css';

interface ActivityLoggerProps {
  onBack: () => void;
  children: Child[];
}

const moodOptions = [
  { value: 'happy', emoji: '😊', label: 'Happy' },
  { value: 'energetic', emoji: '⚡', label: 'Energetic' },
  { value: 'tired', emoji: '😴', label: 'Tired' },
  { value: 'sad', emoji: '😢', label: 'Sad' },
  { value: 'sick', emoji: '🤒', label: 'Sick' },
];

const ActivityLogger = ({ onBack, children }: ActivityLoggerProps) => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState(children[0]?.id || '');
  const [mood, setMood] = useState<string>('happy');
  const [healthNotes, setHealthNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Meals
  const [meals, setMeals] = useState<MealLog[]>([
    { type: 'breakfast', time: '09:30', items: '', consumption: 'all' }
  ]);

  // Nap
  const [naps, setNaps] = useState<NapLog[]>([
    { startTime: '11:30', endTime: '12:15', quality: 'good' }
  ]);

  // Activities
  const [activities, setActivities] = useState<ActivityLog[]>([
    { time: '09:45', activity: '', description: '', participation: 'active', skills: [] }
  ]);

  const addMeal = () => {
    setMeals([...meals, { type: 'snack', time: '11:00', items: '', consumption: 'all' }]);
  };

  const updateMeal = (idx: number, field: string, value: any) => {
    setMeals(meals.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  };

  const removeMeal = (idx: number) => {
    if (meals.length <= 1) return;
    setMeals(meals.filter((_, i) => i !== idx));
  };

  const addNap = () => {
    setNaps([...naps, { startTime: '14:00', endTime: '14:45', quality: 'good' }]);
  };

  const updateNap = (idx: number, field: string, value: any) => {
    setNaps(naps.map((n, i) => i === idx ? { ...n, [field]: value } : n));
  };

  const removeNap = (idx: number) => {
    if (naps.length <= 1) return;
    setNaps(naps.filter((_, i) => i !== idx));
  };

  const addActivity = () => {
    setActivities([...activities, { time: '10:30', activity: '', description: '', participation: 'active', skills: [] }]);
  };

  const updateActivityItem = (idx: number, field: string, value: any) => {
    setActivities(activities.map((a, i) => i === idx ? { ...a, [field]: value } : a));
  };

  const removeActivity = (idx: number) => {
    if (activities.length <= 1) return;
    setActivities(activities.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!user || !selectedChild) return;

    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await createActivity({
        childId: selectedChild,
        date: today,
        teacherId: user.id,
        meals: meals.filter(m => m.items.trim()),
        napTime: naps,
        bathroomLogs: [],
        activities: activities.filter(a => a.activity.trim()),
        mood: mood as any,
        healthNotes: healthNotes || undefined,
        photos: [],
      });
      setSaved(true);
      setTimeout(() => onBack(), 2000);
    } catch (error) {
      console.error('Error saving activity:', error);
      alert('Failed to save activity log');
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="content">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{
            width: '80px', height: '80px',
            background: 'linear-gradient(135deg, #4CAF50, #45a049)',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 24px', color: 'white', fontSize: '48px'
          }}>
            ✓
          </div>
          <h2>Activity Logged!</h2>
          <p>Daily activity has been recorded successfully.</p>
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
        <h2 className="page-title">Log Daily Activity</h2>
      </div>

      <div className="activity-logger-form">
        {/* Child Selection */}
        <div className="form-group">
          <label>Student</label>
          <select value={selectedChild} onChange={e => setSelectedChild(e.target.value)}>
            {children.map(child => (
              <option key={child.id} value={child.id}>{child.name}</option>
            ))}
          </select>
        </div>

        {/* Mood */}
        <div className="form-group">
          <label>Today's Mood</label>
          <div className="mood-selector">
            {moodOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`mood-btn ${mood === opt.value ? 'active' : ''}`}
                onClick={() => setMood(opt.value)}
              >
                <span className="mood-emoji">{opt.emoji}</span>
                <span className="mood-label">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Meals */}
        <div className="form-group">
          <label>Meals</label>
          {meals.map((meal, idx) => (
            <div key={idx} className="logger-entry">
              <div className="logger-entry-row">
                <select value={meal.type} onChange={e => updateMeal(idx, 'type', e.target.value)} style={{ width: '100px' }}>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="snack">Snack</option>
                </select>
                <input type="time" value={meal.time} onChange={e => updateMeal(idx, 'time', e.target.value)} style={{ width: '100px' }} />
                <select value={meal.consumption} onChange={e => updateMeal(idx, 'consumption', e.target.value)} style={{ flex: 1 }}>
                  <option value="all">All</option>
                  <option value="most">Most</option>
                  <option value="some">Some</option>
                  <option value="none">None</option>
                </select>
                <button type="button" onClick={() => removeMeal(idx)} className="icon-btn-sm"><Trash2 size={14} /></button>
              </div>
              <input type="text" value={meal.items} onChange={e => updateMeal(idx, 'items', e.target.value)} placeholder="What was served?" />
            </div>
          ))}
          <button type="button" onClick={addMeal} className="btn-add-activity">
            <Plus size={16} /> Add Meal
          </button>
        </div>

        {/* Nap Time */}
        <div className="form-group">
          <label>Nap Time</label>
          {naps.map((nap, idx) => (
            <div key={idx} className="logger-entry">
              <div className="logger-entry-row">
                <input type="time" value={nap.startTime} onChange={e => updateNap(idx, 'startTime', e.target.value)} style={{ flex: 1 }} />
                <span style={{ color: '#64748b' }}>to</span>
                <input type="time" value={nap.endTime} onChange={e => updateNap(idx, 'endTime', e.target.value)} style={{ flex: 1 }} />
                <select value={nap.quality} onChange={e => updateNap(idx, 'quality', e.target.value)} style={{ width: '100px' }}>
                  <option value="good">Good</option>
                  <option value="restless">Restless</option>
                  <option value="refused">Refused</option>
                </select>
                <button type="button" onClick={() => removeNap(idx)} className="icon-btn-sm"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addNap} className="btn-add-activity">
            <Plus size={16} /> Add Nap
          </button>
        </div>

        {/* Activities */}
        <div className="form-group">
          <label>Activities</label>
          {activities.map((act, idx) => (
            <div key={idx} className="logger-entry">
              <div className="logger-entry-row">
                <input type="time" value={act.time} onChange={e => updateActivityItem(idx, 'time', e.target.value)} style={{ width: '100px' }} />
                <select value={act.participation} onChange={e => updateActivityItem(idx, 'participation', e.target.value)} style={{ flex: 1 }}>
                  <option value="active">Active</option>
                  <option value="moderate">Moderate</option>
                  <option value="minimal">Minimal</option>
                </select>
                <button type="button" onClick={() => removeActivity(idx)} className="icon-btn-sm"><Trash2 size={14} /></button>
              </div>
              <input type="text" value={act.activity} onChange={e => updateActivityItem(idx, 'activity', e.target.value)} placeholder="Activity name (e.g., Circle Time)" />
              <input type="text" value={act.description} onChange={e => updateActivityItem(idx, 'description', e.target.value)} placeholder="Description" />
            </div>
          ))}
          <button type="button" onClick={addActivity} className="btn-add-activity">
            <Plus size={16} /> Add Activity
          </button>
        </div>

        {/* Health Notes */}
        <div className="form-group">
          <label>Health Notes</label>
          <textarea value={healthNotes} onChange={e => setHealthNotes(e.target.value)} rows={2} placeholder="Any health observations..." />
        </div>

        {/* Save */}
        <button className="btn btn-primary btn-block" onClick={handleSave} disabled={saving}>
          <Save size={18} style={{ marginRight: 8 }} />
          {saving ? 'Saving...' : 'Save Activity Log'}
        </button>
      </div>
    </div>
  );
};

export default ActivityLogger;
