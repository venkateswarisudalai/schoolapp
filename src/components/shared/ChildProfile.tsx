import { useState } from 'react';
import { ChevronLeft, AlertTriangle, Phone, Heart, Shield, Pill, User } from 'lucide-react';
import type { Child } from '../../types/index';
import './ChildProfile.css';

interface ChildProfileProps {
  onBack: () => void;
  child: Child;
}

const ChildProfile = ({ onBack, child }: ChildProfileProps) => {
  const [activeTab, setActiveTab] = useState<'info' | 'medical' | 'contacts' | 'pickup'>('info');

  return (
    <div className="content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}><ChevronLeft size={24} /></button>
        <h2 className="page-title">Student Profile</h2>
      </div>

      {/* Child Header */}
      <div className="cp-header">
        <div className="cp-avatar">{child.gender === 'male' ? '👦' : '👧'}</div>
        <h3>{child.name}</h3>
        <p className="cp-class">{child.classId === 'class-1' ? 'Nursery' : child.classId === 'class-2' ? 'LKG' : 'UKG'}</p>
        {child.bloodGroup && <span className="cp-blood">{child.bloodGroup}</span>}
      </div>

      {/* Allergy Alert Banner */}
      {child.allergies && child.allergies.length > 0 && (
        <div className="cp-allergy-alert">
          <AlertTriangle size={18} />
          <div>
            <strong>Allergy Alert</strong>
            <div>{child.allergies.map(a => `${a.allergen} (${a.severity})`).join(', ')}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="cp-tabs">
        {[
          { key: 'info', label: 'Info', icon: <User size={14} /> },
          { key: 'medical', label: 'Medical', icon: <Heart size={14} /> },
          { key: 'contacts', label: 'Emergency', icon: <Phone size={14} /> },
          { key: 'pickup', label: 'Pickup', icon: <Shield size={14} /> },
        ].map(t => (
          <button key={t.key} className={`cp-tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key as typeof activeTab)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="cp-content">
        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="cp-card">
            <div className="cp-field"><span className="cp-field-label">Date of Birth</span><span>{child.dateOfBirth}</span></div>
            <div className="cp-field"><span className="cp-field-label">Gender</span><span className="cp-capitalize">{child.gender}</span></div>
            <div className="cp-field"><span className="cp-field-label">Enrollment Date</span><span>{child.enrollmentDate}</span></div>
            {child.bloodGroup && <div className="cp-field"><span className="cp-field-label">Blood Group</span><span>{child.bloodGroup}</span></div>}
          </div>
        )}

        {/* Medical Tab */}
        {activeTab === 'medical' && (
          <>
            {/* Allergies */}
            <div className="cp-card">
              <h4><AlertTriangle size={16} /> Allergies</h4>
              {child.allergies && child.allergies.length > 0 ? (
                child.allergies.map((a, i) => (
                  <div className="cp-medical-item" key={i}>
                    <div className="cp-medical-header">
                      <span className="cp-medical-name">{a.allergen}</span>
                      <span className={`cp-severity ${a.severity}`}>{a.severity}</span>
                    </div>
                    {a.actionPlan && <p className="cp-action-plan">{a.actionPlan}</p>}
                  </div>
                ))
              ) : (
                <p className="cp-empty">No known allergies</p>
              )}
            </div>

            {/* Medications */}
            <div className="cp-card">
              <h4><Pill size={16} /> Medications</h4>
              {child.medications && child.medications.length > 0 ? (
                child.medications.map((m, i) => (
                  <div className="cp-medical-item" key={i}>
                    <div className="cp-medical-name">{m.name}</div>
                    <div className="cp-med-detail">Dosage: {m.dosage} | Schedule: {m.schedule}</div>
                    {m.prescribedBy && <div className="cp-med-detail">Prescribed by: {m.prescribedBy}</div>}
                  </div>
                ))
              ) : (
                <p className="cp-empty">No medications</p>
              )}
            </div>

            {/* Doctor */}
            {(child.doctorName || child.doctorPhone) && (
              <div className="cp-card">
                <h4><Heart size={16} /> Doctor</h4>
                {child.doctorName && <div className="cp-field"><span className="cp-field-label">Name</span><span>{child.doctorName}</span></div>}
                {child.doctorPhone && <div className="cp-field"><span className="cp-field-label">Phone</span><a href={`tel:${child.doctorPhone}`}>{child.doctorPhone}</a></div>}
              </div>
            )}

            {/* Conditions */}
            {child.medicalConditions && child.medicalConditions.length > 0 && (
              <div className="cp-card">
                <h4>Medical Conditions</h4>
                {child.medicalConditions.map((c, i) => <div className="cp-condition" key={i}>{c}</div>)}
              </div>
            )}
          </>
        )}

        {/* Emergency Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="cp-card">
            <h4><Phone size={16} /> Emergency Contacts</h4>
            {child.emergencyContacts && child.emergencyContacts.length > 0 ? (
              child.emergencyContacts.map((c, i) => (
                <div className="cp-contact-item" key={i}>
                  <div className="cp-contact-header">
                    <span className="cp-contact-name">{c.name}</span>
                    {c.isPrimary && <span className="cp-primary-badge">Primary</span>}
                  </div>
                  <div className="cp-contact-detail">{c.relationship}</div>
                  <a href={`tel:${c.phone}`} className="cp-contact-phone"><Phone size={14} /> {c.phone}</a>
                  {c.canPickup && <span className="cp-pickup-badge">Authorized for pickup</span>}
                </div>
              ))
            ) : (
              <p className="cp-empty">No emergency contacts on file</p>
            )}
          </div>
        )}

        {/* Authorized Pickup Tab */}
        {activeTab === 'pickup' && (
          <div className="cp-card">
            <h4><Shield size={16} /> Authorized Pickup</h4>
            <p className="cp-pickup-note">Only these people are authorized to pick up this child.</p>
            {child.authorizedPickups && child.authorizedPickups.length > 0 ? (
              child.authorizedPickups.map((p, i) => (
                <div className="cp-pickup-item" key={i}>
                  <div className="cp-pickup-name">{p.name}</div>
                  <div className="cp-pickup-detail">{p.relationship} | {p.phone}</div>
                  {p.pin && <div className="cp-pickup-pin">PIN: {p.pin}</div>}
                </div>
              ))
            ) : (
              // Fall back to emergency contacts who can pickup
              child.emergencyContacts?.filter(c => c.canPickup).length > 0 ? (
                child.emergencyContacts.filter(c => c.canPickup).map((c, i) => (
                  <div className="cp-pickup-item" key={i}>
                    <div className="cp-pickup-name">{c.name}</div>
                    <div className="cp-pickup-detail">{c.relationship} | {c.phone}</div>
                  </div>
                ))
              ) : (
                <p className="cp-empty">Emergency contacts are authorized for pickup by default. Add specific authorized persons for additional security.</p>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildProfile;
