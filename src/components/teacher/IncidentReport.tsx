import { useState } from 'react';
import { ChevronLeft, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createIncident } from '../../services/incidentService';
import type { Child } from '../../types/index';
import './IncidentReport.css';

interface IncidentReportProps {
  onBack: () => void;
  children: Child[];
}

const IncidentReport = ({ onBack, children }: IncidentReportProps) => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [severity, setSeverity] = useState<'minor' | 'moderate' | 'serious'>('minor');
  const [witnesses, setWitnesses] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!user || !selectedChild) {
      setError('Please select a student');
      return;
    }
    if (!description.trim()) {
      setError('Please describe what happened');
      return;
    }
    if (!actionTaken.trim()) {
      setError('Please describe the action taken');
      return;
    }

    setSaving(true);
    setError('');

    const child = children.find(c => c.id === selectedChild);
    try {
      await createIncident({
        childId: selectedChild,
        childName: child?.name || '',
        date,
        time,
        location: location.trim(),
        description: description.trim(),
        actionTaken: actionTaken.trim(),
        severity,
        witnesses: witnesses.split(',').map(w => w.trim()).filter(Boolean),
        reportedBy: user.id,
        reportedByName: user.name,
        parentAcknowledged: false,
        createdAt: new Date().toISOString(),
      });
      setSaved(true);
      setTimeout(() => onBack(), 2500);
    } catch (err) {
      console.error(err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="content">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #4CAF50, #45a049)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'white', fontSize: '48px' }}>✓</div>
          <h2>Report Submitted</h2>
          <p>The parent has been notified about this incident.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}><ChevronLeft size={24} /></button>
        <h2 className="page-title">Incident Report</h2>
      </div>

      <div className="incident-form">
        <div className="incident-warning">
          <AlertTriangle size={18} />
          <span>This report will be sent to the parent immediately</span>
        </div>

        <div className="form-group">
          <label className="form-label">Student *</label>
          <select className="form-select" value={selectedChild} onChange={e => setSelectedChild(e.target.value)}>
            <option value="">Select student</option>
            {children.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Time</label>
            <input type="time" className="form-input" value={time} onChange={e => setTime(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Location</label>
          <input type="text" className="form-input" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Playground, Classroom, Cafeteria" />
        </div>

        <div className="form-group">
          <label className="form-label">Severity *</label>
          <div className="severity-selector">
            {(['minor', 'moderate', 'serious'] as const).map(s => (
              <button key={s} type="button" className={`severity-btn ${s} ${severity === s ? 'active' : ''}`} onClick={() => setSeverity(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">What happened? *</label>
          <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the incident in detail..." rows={4} />
        </div>

        <div className="form-group">
          <label className="form-label">Action taken *</label>
          <textarea className="form-textarea" value={actionTaken} onChange={e => setActionTaken(e.target.value)} placeholder="What was done to help the child?" rows={3} />
        </div>

        <div className="form-group">
          <label className="form-label">Witnesses</label>
          <input type="text" className="form-input" value={witnesses} onChange={e => setWitnesses(e.target.value)} placeholder="Names separated by commas" />
        </div>

        {error && <div className="form-error">{error}</div>}

        <button className="btn btn-primary btn-block" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Submitting...' : 'Submit Incident Report'}
        </button>
      </div>
    </div>
  );
};

export default IncidentReport;
