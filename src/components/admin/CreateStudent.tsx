import { useState } from 'react';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { adminCreateStudent } from '../../services/adminService';
import type { AllergyInfo, MedicationInfo, EmergencyContact, AuthorizedPickup } from '../../types/index';
import './CreateStudent.css';

interface CreateStudentProps {
  onBack: () => void;
}

const CreateStudent = ({ onBack }: CreateStudentProps) => {
  // Basic info
  const [studentName, setStudentName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [classId, setClassId] = useState('');
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().split('T')[0]);
  const [bloodGroup, setBloodGroup] = useState('');
  const [address, setAddress] = useState('');

  // Parent info
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPassword, setParentPassword] = useState('Mayuri@123');

  // Medical
  const [allergies, setAllergies] = useState<AllergyInfo[]>([]);
  const [medications, setMedications] = useState<MedicationInfo[]>([]);
  const [medicalConditions, setMedicalConditions] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctorPhone, setDoctorPhone] = useState('');

  // Emergency contacts
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);

  // Authorized pickups
  const [authorizedPickups, setAuthorizedPickups] = useState<AuthorizedPickup[]>([]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ parentUsername: string; parentEmail: string } | null>(null);

  const addAllergy = () => setAllergies(prev => [...prev, { allergen: '', severity: 'mild', actionPlan: '' }]);
  const removeAllergy = (i: number) => setAllergies(prev => prev.filter((_, idx) => idx !== i));
  const updateAllergy = (i: number, field: string, value: string) =>
    setAllergies(prev => prev.map((a, idx) => idx === i ? { ...a, [field]: value } : a));

  const addMedication = () => setMedications(prev => [...prev, { name: '', dosage: '', schedule: '', prescribedBy: '' }]);
  const removeMedication = (i: number) => setMedications(prev => prev.filter((_, idx) => idx !== i));
  const updateMedication = (i: number, field: string, value: string) =>
    setMedications(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));

  const addContact = () => setEmergencyContacts(prev => [...prev, { name: '', relationship: '', phone: '', isPrimary: prev.length === 0, canPickup: true }]);
  const removeContact = (i: number) => setEmergencyContacts(prev => prev.filter((_, idx) => idx !== i));
  const updateContact = (i: number, field: string, value: string | boolean) =>
    setEmergencyContacts(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));

  const addPickup = () => setAuthorizedPickups(prev => [...prev, { name: '', relationship: '', phone: '', pin: '', canPickup: true }]);
  const removePickup = (i: number) => setAuthorizedPickups(prev => prev.filter((_, idx) => idx !== i));
  const updatePickup = (i: number, field: string, value: string | boolean) =>
    setAuthorizedPickups(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !parentName || !parentPhone || !classId || !dateOfBirth) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await adminCreateStudent({
        studentName, dateOfBirth, gender, classId, admissionDate, bloodGroup, address,
        parentName, parentPhone, parentEmail, parentPassword,
        allergies: allergies.filter(a => a.allergen.trim()),
        medications: medications.filter(m => m.name.trim()),
        medicalConditions: medicalConditions.split(',').map(c => c.trim()).filter(Boolean),
        doctorName, doctorPhone,
        emergencyContacts: emergencyContacts.filter(c => c.name.trim() && c.phone.trim()),
        authorizedPickups: authorizedPickups.filter(p => p.name.trim() && p.phone.trim()),
      });
      setResult(res);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create student');
    } finally {
      setLoading(false);
    }
  };

  if (success && result) {
    return (
      <div className="content">
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #4CAF50, #45a049)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'white', fontSize: '48px' }}>✓</div>
          <h2>Student Created!</h2>
          <p style={{ marginBottom: '20px' }}>{studentName} has been added successfully.</p>

          <div style={{ background: '#e8f5e9', padding: '16px', borderRadius: '12px', textAlign: 'left', marginBottom: '12px' }}>
            <strong>Parent Login Credentials:</strong><br />
            Email: <strong>{result.parentEmail}</strong><br />
            Password: <strong>{parentPassword}</strong><br />
            <small style={{ color: '#666' }}>Share these with the parent. They login with their email.</small>
          </div>

          <div style={{ background: '#fff3e0', padding: '12px', borderRadius: '8px', fontSize: '13px', color: '#e65100' }}>
            Save these credentials now. They won't be shown again.
          </div>

          <button className="btn btn-primary btn-block" onClick={onBack} style={{ marginTop: '20px' }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}><ChevronLeft size={24} /></button>
        <h2 className="page-title">Add New Student</h2>
      </div>

      <form className="cs-form" onSubmit={handleSubmit}>
        {/* Student Info */}
        <div className="cs-section">
          <h3 className="cs-section-title">Student Information</h3>
          <div className="cs-field">
            <label>Student Name *</label>
            <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Full name" required />
          </div>
          <div className="cs-row">
            <div className="cs-field"><label>Date of Birth *</label><input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} required /></div>
            <div className="cs-field"><label>Gender *</label><select value={gender} onChange={e => setGender(e.target.value as 'male'|'female')}><option value="male">Male</option><option value="female">Female</option></select></div>
          </div>
          <div className="cs-row">
            <div className="cs-field">
              <label>Class *</label>
              <select value={classId} onChange={e => setClassId(e.target.value)} required>
                <option value="">Select class</option>
                <option value="class-1">Sunshine Nursery</option>
                <option value="class-2">Rainbow LKG</option>
                <option value="class-3">Star UKG</option>
              </select>
            </div>
            <div className="cs-field"><label>Blood Group</label><select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}><option value="">Select</option>{['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => <option key={b} value={b}>{b}</option>)}</select></div>
          </div>
          <div className="cs-field"><label>Admission Date</label><input type="date" value={admissionDate} onChange={e => setAdmissionDate(e.target.value)} /></div>
          <div className="cs-field"><label>Address</label><textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Full address" rows={2} /></div>
        </div>

        {/* Parent Info */}
        <div className="cs-section">
          <h3 className="cs-section-title">Parent / Guardian</h3>
          <div className="cs-field"><label>Parent Name *</label><input type="text" value={parentName} onChange={e => setParentName(e.target.value)} placeholder="Full name" required /></div>
          <div className="cs-field"><label>Parent Email / Gmail *</label><input type="email" value={parentEmail} onChange={e => setParentEmail(e.target.value)} placeholder="parent@gmail.com" required /></div>
          <small className="cs-hint">Parent will login with this email. Password reset will be sent here.</small>
          <div className="cs-row">
            <div className="cs-field"><label>Phone *</label><input type="tel" value={parentPhone} onChange={e => setParentPhone(e.target.value)} placeholder="9876543210" required /></div>
            <div className="cs-field"><label>Password</label><input type="text" value={parentPassword} onChange={e => setParentPassword(e.target.value)} /></div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="cs-section">
          <h3 className="cs-section-title">Emergency Contacts <button type="button" className="cs-add-btn" onClick={addContact}><Plus size={14} /> Add</button></h3>
          {emergencyContacts.length === 0 && <p className="cs-hint">Parent will be added as primary contact automatically.</p>}
          {emergencyContacts.map((c, i) => (
            <div className="cs-entry" key={i}>
              <div className="cs-row">
                <input placeholder="Name" value={c.name} onChange={e => updateContact(i, 'name', e.target.value)} />
                <input placeholder="Relationship" value={c.relationship} onChange={e => updateContact(i, 'relationship', e.target.value)} />
              </div>
              <div className="cs-row">
                <input placeholder="Phone" value={c.phone} onChange={e => updateContact(i, 'phone', e.target.value)} />
                <label className="cs-checkbox"><input type="checkbox" checked={c.canPickup} onChange={e => updateContact(i, 'canPickup', e.target.checked)} /> Can pickup</label>
                <button type="button" className="cs-remove-btn" onClick={() => removeContact(i)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Authorized Pickups */}
        <div className="cs-section">
          <h3 className="cs-section-title">Authorized Pickups <button type="button" className="cs-add-btn" onClick={addPickup}><Plus size={14} /> Add</button></h3>
          <p className="cs-hint">People authorized to pick up this child (besides emergency contacts).</p>
          {authorizedPickups.map((p, i) => (
            <div className="cs-entry" key={i}>
              <div className="cs-row">
                <input placeholder="Name" value={p.name} onChange={e => updatePickup(i, 'name', e.target.value)} />
                <input placeholder="Relationship" value={p.relationship} onChange={e => updatePickup(i, 'relationship', e.target.value)} />
              </div>
              <div className="cs-row">
                <input placeholder="Phone" value={p.phone} onChange={e => updatePickup(i, 'phone', e.target.value)} />
                <input placeholder="PIN (4 digits)" value={p.pin} onChange={e => updatePickup(i, 'pin', e.target.value)} maxLength={4} style={{maxWidth:'100px'}} />
                <button type="button" className="cs-remove-btn" onClick={() => removePickup(i)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Medical */}
        <div className="cs-section">
          <h3 className="cs-section-title">Medical Information</h3>
          <div className="cs-row">
            <div className="cs-field"><label>Doctor Name</label><input value={doctorName} onChange={e => setDoctorName(e.target.value)} placeholder="Dr. Name" /></div>
            <div className="cs-field"><label>Doctor Phone</label><input value={doctorPhone} onChange={e => setDoctorPhone(e.target.value)} placeholder="Phone" /></div>
          </div>
          <div className="cs-field"><label>Medical Conditions</label><input value={medicalConditions} onChange={e => setMedicalConditions(e.target.value)} placeholder="Comma separated (e.g. Asthma, Eczema)" /></div>

          {/* Allergies */}
          <h4 className="cs-sub-title">Allergies <button type="button" className="cs-add-btn" onClick={addAllergy}><Plus size={14} /> Add</button></h4>
          {allergies.map((a, i) => (
            <div className="cs-entry" key={i}>
              <div className="cs-row">
                <input placeholder="Allergen (e.g. Peanuts)" value={a.allergen} onChange={e => updateAllergy(i, 'allergen', e.target.value)} />
                <select value={a.severity} onChange={e => updateAllergy(i, 'severity', e.target.value)}>
                  <option value="mild">Mild</option><option value="moderate">Moderate</option><option value="severe">Severe</option>
                </select>
                <button type="button" className="cs-remove-btn" onClick={() => removeAllergy(i)}><Trash2 size={14} /></button>
              </div>
              <input placeholder="Action plan (e.g. Give antihistamine)" value={a.actionPlan} onChange={e => updateAllergy(i, 'actionPlan', e.target.value)} style={{marginTop:'4px'}} />
            </div>
          ))}

          {/* Medications */}
          <h4 className="cs-sub-title">Medications <button type="button" className="cs-add-btn" onClick={addMedication}><Plus size={14} /> Add</button></h4>
          {medications.map((m, i) => (
            <div className="cs-entry" key={i}>
              <div className="cs-row">
                <input placeholder="Medicine name" value={m.name} onChange={e => updateMedication(i, 'name', e.target.value)} />
                <input placeholder="Dosage" value={m.dosage} onChange={e => updateMedication(i, 'dosage', e.target.value)} />
                <button type="button" className="cs-remove-btn" onClick={() => removeMedication(i)}><Trash2 size={14} /></button>
              </div>
              <div className="cs-row" style={{marginTop:'4px'}}>
                <input placeholder="Schedule (e.g. Once daily)" value={m.schedule} onChange={e => updateMedication(i, 'schedule', e.target.value)} />
                <input placeholder="Prescribed by" value={m.prescribedBy} onChange={e => updateMedication(i, 'prescribedBy', e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        {error && <div className="form-error" style={{margin:'0 16px'}}>{error}</div>}

        <div style={{ padding: '16px' }}>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating...' : 'Create Student & Parent Account'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateStudent;
