import { useState, useEffect } from 'react';
import { ChevronLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import { getIncidentsByChild, acknowledgeIncident } from '../../services/incidentService';
import type { Child, IncidentReport } from '../../types/index';
import './IncidentViewer.css';

interface IncidentViewerProps {
  onBack: () => void;
  children: Child[];
}

const severityColors = { minor: '#ff9800', moderate: '#f57c00', serious: '#d32f2f' };

const IncidentViewer = ({ onBack, children: childrenProp }: IncidentViewerProps) => {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const all: IncidentReport[] = [];
      for (const child of childrenProp) {
        const childIncidents = await getIncidentsByChild(child.id);
        all.push(...childIncidents);
      }
      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setIncidents(all);
      setLoading(false);
    };
    load();
  }, [childrenProp]);

  const handleAcknowledge = async (id: string) => {
    await acknowledgeIncident(id);
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, parentAcknowledged: true, parentAcknowledgedAt: new Date().toISOString() } : i));
  };

  return (
    <div className="content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}><ChevronLeft size={24} /></button>
        <h2 className="page-title">Incident Reports</h2>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading...</div>
      ) : incidents.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#999' }}>
          <CheckCircle size={48} style={{ color: '#4CAF50', marginBottom: '16px' }} />
          <h3 style={{ color: '#666' }}>No incidents</h3>
          <p>No incidents have been reported for your child.</p>
        </div>
      ) : (
        <div className="incident-list">
          {incidents.map(inc => (
            <div className={`incident-card ${inc.severity}`} key={inc.id}>
              <div className="incident-card-header">
                <div className="incident-severity" style={{ color: severityColors[inc.severity] }}>
                  <AlertTriangle size={16} />
                  <span>{inc.severity.toUpperCase()}</span>
                </div>
                <span className="incident-date">{new Date(inc.createdAt).toLocaleDateString()}</span>
              </div>
              <h4 className="incident-child">{inc.childName}</h4>
              <div className="incident-detail">
                <span className="incident-detail-label">What happened:</span>
                <p>{inc.description}</p>
              </div>
              <div className="incident-detail">
                <span className="incident-detail-label">Action taken:</span>
                <p>{inc.actionTaken}</p>
              </div>
              <div className="incident-meta">
                <span>Time: {inc.time}</span>
                {inc.location && <span>Location: {inc.location}</span>}
                <span>Reported by: {inc.reportedByName}</span>
              </div>
              {!inc.parentAcknowledged ? (
                <button className="btn-acknowledge" onClick={() => handleAcknowledge(inc.id)}>
                  <CheckCircle size={16} /> Acknowledge
                </button>
              ) : (
                <div className="incident-acknowledged">
                  <CheckCircle size={14} /> Acknowledged {inc.parentAcknowledgedAt && new Date(inc.parentAcknowledgedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IncidentViewer;
