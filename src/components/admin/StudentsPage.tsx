import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ChevronLeft, Search, Users as UsersIcon, Edit3, Trash2, Save, RefreshCw } from 'lucide-react';
import { regenerateParentPassword, migrateParentToAdmissionUserid } from '../../services/adminService';
import './StudentsPage.css';

interface Student {
  id: string;
  admissionNumber?: string;
  name: string;
  parentId?: string;
  parentIds?: string[];
  studentUserId: string;
  classId: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  address: string;
  emergencyContact: string;
  medicalInfo?: string;
  admissionDate: string;
}

// Imported students store parentIds (array); legacy students used parentId (string).
const resolveParentId = (student: Pick<Student, 'parentId' | 'parentIds'>): string | undefined => {
  return student.parentId || student.parentIds?.[0];
};

interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  initialPassword?: string;
}

interface StudentsPageProps {
  onBack: () => void;
}

const StudentsPage = ({ onBack }: StudentsPageProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);

      // Load all students (children collection)
      const studentsSnapshot = await getDocs(collection(db, 'children'));
      const studentsData = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Student));

      // Load all parents
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const parentsData = usersSnapshot.docs
        .filter(doc => doc.data().role === 'parent')
        .map(doc => ({
          id: doc.id,
          name: doc.data().name,
          email: doc.data().email,
          phone: doc.data().phone,
          initialPassword: doc.data().initialPassword,
        } as Parent));

      setStudents(studentsData);
      setParents(parentsData);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [resettingPassword, setResettingPassword] = useState(false);

  const handleMigrateUserid = async (parentId: string, studentId: string) => {
    if (!confirm(
      'Change this parent\'s login userid to match the student\'s admission number? ' +
      'The parent will need to log in with the NEW userid + a new password we generate.'
    )) return;
    const adminHint = prompt(
      'If you know the parent\'s current password, enter it. Otherwise leave blank — we\'ll try the default.',
      '',
    );
    setResettingPassword(true);
    try {
      const res = await migrateParentToAdmissionUserid(
        parentId,
        studentId,
        adminHint ? [adminHint] : [],
      );
      // Update local state so the UI reflects the new parent UID + creds
      setParents(prev => {
        const others = prev.filter(p => p.id !== parentId);
        const old = prev.find(p => p.id === parentId);
        return [
          ...others,
          {
            id: res.newUserId,
            name: old?.name || '',
            email: res.newEmail,
            phone: old?.phone || '',
            initialPassword: res.newPassword,
          },
        ];
      });
      setStudents(prev => prev.map(s => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          parentId: res.newUserId,
          parentIds: (s.parentIds || [s.parentId].filter(Boolean) as string[]).map(id => id === parentId ? res.newUserId : id),
        };
      }));
      setSelectedStudent(prev => prev && prev.id === studentId ? {
        ...prev,
        parentId: res.newUserId,
        parentIds: (prev.parentIds || [prev.parentId].filter(Boolean) as string[]).map(id => id === parentId ? res.newUserId : id),
      } : prev);
      alert(
        `Migrated.\n\nNew Userid: ${res.newEmail.split('@')[0]}\nNew Password: ${res.newPassword}\n\n` +
        `Share these with the parent. The old userid no longer works.`
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to migrate userid');
    } finally {
      setResettingPassword(false);
    }
  };

  const handleResetParentPassword = async (parentId: string) => {
    if (!confirm('Generate a new login password for this parent? Any current login will stop working.')) return;
    const adminHint = prompt(
      'Optional: if you know the parent\'s current password, enter it (improves success rate). Otherwise leave blank — we\'ll try the default.',
      '',
    );
    setResettingPassword(true);
    try {
      const newPwd = await regenerateParentPassword(parentId, adminHint ? [adminHint] : []);
      setParents(prev => prev.map(p => p.id === parentId ? { ...p, initialPassword: newPwd } : p));
      alert(`New password: ${newPwd}\n\nCopy this and share with the parent. It's now saved on the student detail page.`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
      setResettingPassword(false);
    }
  };

  const getClassName = (classId: string) => {
    const classNames: Record<string, string> = {
      'class-1': 'Nursery', 'class-2': 'LKG', 'class-3': 'UKG',
      'nursery': 'Nursery', 'lkg': 'LKG', 'ukg': 'UKG'
    };
    return classNames[classId] || classId;
  };

  const handleSaveEdit = async () => {
    if (!selectedStudent) return;
    try {
      await updateDoc(doc(db, 'children', selectedStudent.id), editData);
      setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, ...editData } as Student : s));
      setSelectedStudent({ ...selectedStudent, ...editData } as Student);
      setEditing(false);
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Failed to update student');
    }
  };

  const handleDelete = async (studentId: string) => {
    if (!confirm('Are you sure you want to remove this student? This cannot be undone.')) return;
    try {
      // Capture the parent ID(s) before deleting so we can clean up orphan parent
      // user docs (auth account can't be removed from the client SDK, but removing
      // the user doc lets a fresh import recreate the parent record cleanly).
      const studentDoc = students.find(s => s.id === studentId);
      const parentIdsToCheck: string[] = [];
      if (studentDoc?.parentId) parentIdsToCheck.push(studentDoc.parentId);
      const rawParentIds = (studentDoc as unknown as { parentIds?: string[] })?.parentIds;
      if (Array.isArray(rawParentIds)) parentIdsToCheck.push(...rawParentIds);

      await deleteDoc(doc(db, 'children', studentId));

      // For each parent, check if they have any other children left. If not,
      // delete the parent user doc so a re-import with the same email succeeds.
      for (const parentId of [...new Set(parentIdsToCheck)]) {
        if (!parentId) continue;
        const [legacy, modern] = await Promise.all([
          getDocs(query(collection(db, 'children'), where('parentId', '==', parentId))),
          getDocs(query(collection(db, 'children'), where('parentIds', 'array-contains', parentId))),
        ]);
        if (legacy.empty && modern.empty) {
          await deleteDoc(doc(db, 'users', parentId));
        }
      }

      setStudents(prev => prev.filter(s => s.id !== studentId));
      setSelectedStudent(null);
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student');
    }
  };

  const getParentInfo = (parentId: string | undefined) => {
    if (!parentId) return undefined;
    return parents.find(p => p.id === parentId);
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Get counts by class
  const nurseryCount = students.filter(s => s.classId === 'class-1' || s.classId === 'nursery').length;
  const lkgCount = students.filter(s => s.classId === 'class-2' || s.classId === 'lkg').length;
  const ukgCount = students.filter(s => s.classId === 'class-3' || s.classId === 'ukg').length;

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = selectedClass === 'all' || student.classId === selectedClass;

    return matchesSearch && matchesClass;
  });

  if (loading) {
    return (
      <div className="students-page-container">
        <div className="page-header">
          <button className="back-btn" onClick={onBack}>
            <ChevronLeft size={24} />
          </button>
          <h2 className="page-title">Students</h2>
        </div>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="students-page-container">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="page-title">All Students</h2>
      </div>

      {/* Class Summary Cards */}
      <div className="class-summary">
        <div
          className={`summary-card total ${selectedClass === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedClass('all')}
        >
          <div className="summary-icon">👶</div>
          <div className="summary-number">{students.length}</div>
          <div className="summary-label">Total Students</div>
        </div>

        <div
          className={`summary-card nursery ${selectedClass === 'class-1' ? 'active' : ''}`}
          onClick={() => setSelectedClass('class-1')}
        >
          <div className="summary-icon">🌱</div>
          <div className="summary-number">{nurseryCount}</div>
          <div className="summary-label">Nursery</div>
        </div>

        <div
          className={`summary-card lkg ${selectedClass === 'class-2' ? 'active' : ''}`}
          onClick={() => setSelectedClass('class-2')}
        >
          <div className="summary-icon">📚</div>
          <div className="summary-number">{lkgCount}</div>
          <div className="summary-label">LKG</div>
        </div>

        <div
          className={`summary-card ukg ${selectedClass === 'class-3' ? 'active' : ''}`}
          onClick={() => setSelectedClass('class-3')}
        >
          <div className="summary-icon">🎓</div>
          <div className="summary-number">{ukgCount}</div>
          <div className="summary-label">UKG</div>
        </div>
      </div>

      {/* Search */}
      <div className="students-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search student by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Students List */}
      <div className="students-list">
        {filteredStudents.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            {searchTerm ? 'No students found matching your search.' : 'No students found.'}
          </div>
        ) : (
          <>
            <div className="students-count">
              Showing {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
              {selectedClass !== 'all' && ` in ${getClassName(selectedClass)}`}
            </div>
            {filteredStudents.map((student) => {
              const parent = getParentInfo(resolveParentId(student));
              const age = calculateAge(student.dateOfBirth);

              return (
                <div
                  key={student.id}
                  className="student-card"
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="student-card-header">
                    <div className="student-avatar">
                      {student.gender === 'male' ? '👦' : '👧'}
                    </div>
                    <div className="student-info">
                      <h3>{student.name}</h3>
                      {student.admissionNumber && (
                        <div style={{ fontSize: '12px', color: '#1565c0', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '4px' }}>
                          {student.admissionNumber}
                        </div>
                      )}
                      <div className="student-meta">
                        <span className={`class-badge ${student.classId}`}>
                          {getClassName(student.classId)}
                        </span>
                        <span className="age-badge">{age} years old</span>
                        <span className="gender-badge">{student.gender}</span>
                      </div>
                    </div>
                  </div>

                  <div className="student-details">
                    <div className="detail-row">
                      <strong>Parent:</strong>
                      <span>{parent?.name || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Phone:</strong>
                      <span>{parent?.phone || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Date of Birth:</strong>
                      <span>{new Date(student.dateOfBirth).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Admission Date:</strong>
                      <span>{new Date(student.admissionDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <UsersIcon size={24} />
              <h3>Student Details</h3>
            </div>

            <div className="student-details-full">
              <div className="detail-section">
                <h4>Student Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Name:</strong>
                    <span>{selectedStudent.name}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Class:</strong>
                    <span className={`class-badge ${selectedStudent.classId}`}>
                      {getClassName(selectedStudent.classId)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Gender:</strong>
                    <span>{selectedStudent.gender}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Date of Birth:</strong>
                    <span>{new Date(selectedStudent.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Age:</strong>
                    <span>{calculateAge(selectedStudent.dateOfBirth)} years</span>
                  </div>
                  <div className="detail-item">
                    <strong>Admission Date:</strong>
                    <span>{new Date(selectedStudent.admissionDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Parent/Guardian Information</h4>
                <div className="detail-grid">
                  {(() => {
                    const parent = getParentInfo(resolveParentId(selectedStudent));
                    return parent ? (
                      <>
                        <div className="detail-item">
                          <strong>Name:</strong>
                          <span>{parent.name}</span>
                        </div>
                        <div className="detail-item">
                          <strong>Email:</strong>
                          <span>{parent.email}</span>
                        </div>
                        <div className="detail-item">
                          <strong>Phone:</strong>
                          <span>{parent.phone}</span>
                        </div>
                      </>
                    ) : (
                      <div className="detail-item">
                        <span>No parent information available</span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {(() => {
                const parent = getParentInfo(resolveParentId(selectedStudent));
                if (!parent) return null;
                // The userid is whatever the parent's actual auth email is (local part).
                // If the parent was imported pre-deploy, this might be priya.kumar etc.
                // If imported post-deploy, this is the admission number (mkp-prekg-01).
                const actualUserid = parent.email.split('@')[0];
                const userid = actualUserid;
                const expectedUserid = (selectedStudent.admissionNumber || '').toLowerCase();
                const useridMatchesAdmission = expectedUserid && actualUserid.toLowerCase() === expectedUserid;
                const hasPassword = !!parent.initialPassword;
                const credText = hasPassword ? `Userid: ${userid}\nPassword: ${parent.initialPassword}` : '';
                return (
                  <div className="detail-section">
                    <h4>Parent Login (shareable)</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <strong>Userid:</strong>
                        <span style={{ fontFamily: 'monospace', color: '#1565c0' }}>{userid}</span>
                      </div>
                      <div className="detail-item">
                        <strong>Password:</strong>
                        {hasPassword ? (
                          <span style={{ fontFamily: 'monospace', color: '#c62828' }}>{parent.initialPassword}</span>
                        ) : (
                          <span style={{ color: '#888', fontStyle: 'italic' }}>
                            Not stored — click "Generate password" below
                          </span>
                        )}
                      </div>
                      {expectedUserid && !useridMatchesAdmission && (
                        <div className="detail-item full-width" style={{
                          background: '#fff3cd',
                          color: '#856404',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          border: '1px solid #ffeeba',
                        }}>
                          ⚠️ This parent's userid is <strong>{userid}</strong>, not <strong>{expectedUserid}</strong>.
                          To use the admission number as the userid, click "Migrate userid" below.
                        </div>
                      )}
                      <div className="detail-item full-width" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {hasPassword && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(credText);
                              alert('Parent login copied. Share via WhatsApp / SMS.');
                            }}
                            style={{
                              padding: '8px 14px',
                              background: '#00897B',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '13px',
                            }}
                          >
                            Copy login to clipboard
                          </button>
                        )}
                        <button
                          onClick={() => handleResetParentPassword(parent.id)}
                          disabled={resettingPassword}
                          style={{
                            padding: '8px 14px',
                            background: hasPassword ? '#f5f5f5' : '#1565c0',
                            color: hasPassword ? '#444' : 'white',
                            border: hasPassword ? '1px solid #ddd' : 'none',
                            borderRadius: '8px',
                            cursor: resettingPassword ? 'wait' : 'pointer',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <RefreshCw size={14} />
                          {resettingPassword
                            ? 'Working...'
                            : hasPassword
                              ? 'Regenerate password'
                              : 'Generate password'}
                        </button>
                        {expectedUserid && !useridMatchesAdmission && (
                          <button
                            onClick={() => handleMigrateUserid(parent.id, selectedStudent.id)}
                            disabled={resettingPassword}
                            style={{
                              padding: '8px 14px',
                              background: '#1565c0',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: resettingPassword ? 'wait' : 'pointer',
                              fontSize: '13px',
                            }}
                          >
                            Migrate userid to {expectedUserid}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="detail-section">
                <h4>Contact & Medical Information</h4>
                <div className="detail-grid">
                  <div className="detail-item full-width">
                    <strong>Address:</strong>
                    <span>{selectedStudent.address}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Emergency Contact:</strong>
                    <span>{selectedStudent.emergencyContact}</span>
                  </div>
                  {selectedStudent.medicalInfo && (
                    <div className="detail-item full-width">
                      <strong>Medical Info:</strong>
                      <span className="medical-info">{selectedStudent.medicalInfo}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {editing ? (
              <div className="modal-edit-form" style={{ padding: '0 16px 16px' }}>
                <h4 style={{ margin: '0 0 12px' }}>Edit Details</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input placeholder="Address" value={editData.address ?? selectedStudent.address ?? ''} onChange={e => setEditData(prev => ({...prev, address: e.target.value}))} style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }} />
                  <input placeholder="Emergency Contact" value={editData.emergencyContact ?? selectedStudent.emergencyContact ?? ''} onChange={e => setEditData(prev => ({...prev, emergencyContact: e.target.value}))} style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }} />
                  <select value={editData.classId ?? selectedStudent.classId} onChange={e => setEditData(prev => ({...prev, classId: e.target.value}))} style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}>
                    <option value="class-1">Nursery</option><option value="class-2">LKG</option><option value="class-3">UKG</option>
                  </select>
                  <textarea placeholder="Medical Info" value={editData.medicalInfo ?? (selectedStudent.medicalInfo || '')} onChange={e => setEditData(prev => ({...prev, medicalInfo: e.target.value}))} rows={2} style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }} />
                </div>
              </div>
            ) : null}

            <div className="modal-actions" style={{ display: 'flex', gap: '8px' }}>
              {editing ? (
                <>
                  <button className="btn-secondary" onClick={() => setEditing(false)} style={{ flex: 1 }}>Cancel</button>
                  <button onClick={handleSaveEdit} style={{ flex: 1, padding: '10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Save size={16} /> Save
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-secondary" onClick={() => setSelectedStudent(null)} style={{ flex: 1 }}>Close</button>
                  <button onClick={() => { setEditData({}); setEditing(true); }} style={{ flex: 1, padding: '10px', background: '#00897B', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Edit3 size={16} /> Edit
                  </button>
                  <button onClick={() => handleDelete(selectedStudent.id)} style={{ padding: '10px 14px', background: '#ffebee', color: '#f44336', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
