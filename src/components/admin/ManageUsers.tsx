import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { migrateParentToGmail } from '../../services/adminService';
import { ChevronLeft, Search, Trash2, User as UserIcon, Edit3, Save, Mail } from 'lucide-react';
import './ManageUsers.css';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string;
  approvalStatus: string;
  childId?: string;
}

interface Child {
  id: string;
  name: string;
  parentId: string;
  studentUserId: string;
  classId: string;
}

interface ManageUsersProps {
  onBack: () => void;
}

const ManageUsers = ({ onBack }: ManageUsersProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [viewUserInfo, setViewUserInfo] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Load all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));

      // Load all children
      const childrenSnapshot = await getDocs(collection(db, 'children'));
      const childrenData = childrenSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Child));

      setUsers(usersData);
      setChildren(childrenData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUsername = (email: string) => {
    if (!email) return 'N/A';
    return email.split('@')[0];
  };

  const getStudentInfo = (userId: string) => {
    const child = children.find(c => c.studentUserId === userId || c.parentId === userId);
    return child;
  };

  const getClassName = (classId: string) => {
    const classNames: Record<string, string> = {
      'class-1': 'Nursery', 'class-2': 'LKG', 'class-3': 'UKG',
      'nursery': 'Nursery', 'lkg': 'LKG', 'ukg': 'UKG'
    };
    return classNames[classId] || classId;
  };

  const handleDeleteUser = async (user: User) => {
    if (!deleteConfirm) {
      setDeleteConfirm(user);
      return;
    }

    try {
      // Prevent admin from deleting themselves
      if (user.id === auth.currentUser?.uid) {
        alert('You cannot delete your own account while logged in!');
        setDeleteConfirm(null);
        return;
      }

      // Delete user document from Firestore
      await deleteDoc(doc(db, 'users', user.id));

      // If user is a student or parent, also delete the child document
      const childInfo = getStudentInfo(user.id);
      if (childInfo) {
        await deleteDoc(doc(db, 'children', childInfo.id));
      }

      // Note: Firebase Authentication user deletion requires Firebase Admin SDK
      // For now, we're only deleting from Firestore
      alert(`User "${user.name}" has been removed from the system.\n\nNote: The authentication account still exists. To fully delete, use Firebase Console.`);

      // Reload users
      await loadUsers();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
      setDeleteConfirm(null);
    }
  };

  const filteredUsers = users.filter(user => {
    // Search filter
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getUsername(user.email).toLowerCase().includes(searchTerm.toLowerCase());

    // Role filter
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;

    // Class filter (only for students/parents)
    let matchesClass = true;
    if (selectedClass !== 'all' && (user.role === 'student' || user.role === 'parent')) {
      const childInfo = getStudentInfo(user.id);
      matchesClass = childInfo?.classId === selectedClass;
    }

    return matchesSearch && matchesRole && matchesClass;
  });

  if (loading) {
    return (
      <div className="manage-users-container">
        <div className="page-header">
          <button className="back-btn" onClick={onBack}>
            <ChevronLeft size={24} />
          </button>
          <h2 className="page-title">Manage Users</h2>
        </div>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-users-container">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="page-title">Manage Users</h2>
      </div>

      {/* Search and Filters */}
      <div className="users-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-row">
          <div className="role-filter">
            <label>Role:</label>
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="parent">Parent</option>
              <option value="student">Student</option>
            </select>
          </div>

          {(selectedRole === 'student' || selectedRole === 'parent' || selectedRole === 'all') && (
            <div className="class-filter">
              <label>Class:</label>
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                <option value="all">All Classes</option>
                <option value="nursery">Nursery</option>
                <option value="lkg">LKG</option>
                <option value="ukg">UKG</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Users List */}
      <div className="users-list">
        {filteredUsers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            No users found matching your filters.
          </div>
        ) : (
          filteredUsers.map((user) => {
            const username = getUsername(user.email);
            const studentInfo = getStudentInfo(user.id);

            return (
              <div key={user.id} className="user-card">
                <div className="user-card-header">
                  <div className="user-avatar">
                    {user.role === 'admin' && '👨‍💼'}
                    {user.role === 'teacher' && '👩‍🏫'}
                    {user.role === 'parent' && '👨‍👩‍👧'}
                    {user.role === 'student' && '👦'}
                  </div>
                  <div className="user-info">
                    <h3>{user.name || 'N/A'}</h3>
                    <div className="badges">
                      <span className={`role-badge ${user.role}`}>{user.role}</span>
                      {studentInfo && (
                        <span className={`class-badge ${studentInfo.classId}`}>
                          {getClassName(studentInfo.classId)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="user-credentials">
                  <div className="credential-item">
                    <strong>Username:</strong>
                    <span className="credential-value">{username}</span>
                  </div>
                  <div className="credential-item">
                    <strong>Email:</strong>
                    <span className="credential-value">{user.email || 'N/A'}</span>
                  </div>
                  {user.phone && (
                    <div className="credential-item">
                      <strong>Phone:</strong>
                      <span className="credential-value">{user.phone}</span>
                    </div>
                  )}
                  {studentInfo && (
                    <div className="credential-item">
                      <strong>Student:</strong>
                      <span className="credential-value">{studentInfo.name}</span>
                    </div>
                  )}
                  <div className="credential-item">
                    <strong>Status:</strong>
                    <span className={`status-badge ${user.approvalStatus}`}>
                      {user.approvalStatus}
                    </span>
                  </div>
                </div>

                <div className="user-actions">
                  <button
                    className="btn-view-info"
                    onClick={() => setViewUserInfo(user)}
                  >
                    <UserIcon size={16} />
                    View Info
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteUser(user)}
                    disabled={user.id === auth.currentUser?.uid}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* View/Edit User Info Modal */}
      {viewUserInfo && (() => {
        const EditableModal = () => {
          const [editing, setEditing] = useState(false);
          const [editName, setEditName] = useState(viewUserInfo.name);
          const [editPhone, setEditPhone] = useState(viewUserInfo.phone || '');
          const [editRole, setEditRole] = useState(viewUserInfo.role);
          const [saving, setSaving] = useState(false);
          const [saved, setSaved] = useState(false);
          const [showMigrate, setShowMigrate] = useState(false);
          const [newGmail, setNewGmail] = useState('');
          const [migratePassword, setMigratePassword] = useState('Mayuri@123');
          const [migrating, setMigrating] = useState(false);
          const [migrateResult, setMigrateResult] = useState<string | null>(null);

          const handleSave = async () => {
            setSaving(true);
            try {
              await updateDoc(doc(db, 'users', viewUserInfo.id), {
                name: editName,
                phone: editPhone,
                role: editRole,
              });
              // Update local state
              setUsers(prev => prev.map(u => u.id === viewUserInfo.id ? { ...u, name: editName, phone: editPhone, role: editRole } : u));
              setViewUserInfo({ ...viewUserInfo, name: editName, phone: editPhone, role: editRole });
              setSaved(true);
              setTimeout(() => { setSaved(false); setEditing(false); }, 1500);
            } catch (error) {
              console.error('Error updating user:', error);
              alert('Failed to update');
            } finally {
              setSaving(false);
            }
          };

          const childInfo = getStudentInfo(viewUserInfo.id);

          return (
            <div className="modal-overlay" onClick={() => setViewUserInfo(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <UserIcon size={24} />
                  <h3>{editing ? 'Edit User' : 'User Information'}</h3>
                </div>

                <div className="user-info-details">
                  {editing ? (
                    <>
                      <div className="info-row"><strong>Name:</strong><input value={editName} onChange={e => setEditName(e.target.value)} style={{ flex: 1, padding: '6px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} /></div>
                      <div className="info-row"><strong>Phone:</strong><input value={editPhone} onChange={e => setEditPhone(e.target.value)} style={{ flex: 1, padding: '6px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} /></div>
                      <div className="info-row"><strong>Role:</strong>
                        <select value={editRole} onChange={e => setEditRole(e.target.value)} style={{ flex: 1, padding: '6px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}>
                          <option value="parent">Parent</option>
                          <option value="teacher">Teacher</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div className="info-row"><strong>Login Email:</strong><span style={{ color: '#999', fontSize: '13px' }}>{viewUserInfo.email} (cannot change login email)</span></div>
                      {saved && <div style={{ padding: '8px 12px', background: '#e8f5e9', borderRadius: '8px', color: '#2e7d32', fontSize: '13px', textAlign: 'center' }}>Saved!</div>}
                    </>
                  ) : (
                    <>
                      <div className="info-row"><strong>Name:</strong><span>{viewUserInfo.name}</span></div>
                      <div className="info-row"><strong>Login:</strong><span className="highlight">{viewUserInfo.email}</span></div>
                      <div className="info-row"><strong>Role:</strong><span className={'role-badge ' + viewUserInfo.role}>{viewUserInfo.role}</span></div>
                      {viewUserInfo.phone && <div className="info-row"><strong>Phone:</strong><span>{viewUserInfo.phone}</span></div>}
                      {childInfo && (
                        <>
                          <div className="info-row"><strong>Student:</strong><span>{childInfo.name}</span></div>
                          <div className="info-row"><strong>Class:</strong><span className={'class-badge ' + childInfo.classId}>{getClassName(childInfo.classId)}</span></div>
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Migrate to Gmail */}
                {viewUserInfo.email?.includes('@mayurischool.com') && viewUserInfo.role === 'parent' && (
                  <div style={{ padding: '0 16px', marginBottom: '12px' }}>
                    {!showMigrate ? (
                      <button
                        onClick={() => setShowMigrate(true)}
                        style={{ width: '100%', padding: '10px', background: '#fff3e0', border: '1px solid #ff9800', borderRadius: '10px', color: '#e65100', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <Mail size={16} /> Migrate to Gmail
                      </button>
                    ) : migrateResult ? (
                      <div style={{ padding: '12px', background: '#e8f5e9', borderRadius: '10px', fontSize: '13px', color: '#2e7d32', textAlign: 'center' }}>
                        {migrateResult}
                      </div>
                    ) : (
                      <div style={{ padding: '12px', background: '#fff3e0', borderRadius: '10px' }}>
                        <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#e65100' }}>
                          Enter parent's real Gmail. This will be their new login.
                        </p>
                        <input
                          type="email"
                          value={newGmail}
                          onChange={e => setNewGmail(e.target.value)}
                          placeholder="parent@gmail.com"
                          style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', marginBottom: '6px', boxSizing: 'border-box' }}
                        />
                        <input
                          type="text"
                          value={migratePassword}
                          onChange={e => setMigratePassword(e.target.value)}
                          placeholder="Password"
                          style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', marginBottom: '8px', boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => setShowMigrate(false)} style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                          <button
                            disabled={migrating || !newGmail.includes('@')}
                            onClick={async () => {
                              setMigrating(true);
                              try {
                                const result = await migrateParentToGmail(viewUserInfo.id, newGmail, migratePassword);
                                setMigrateResult(`Migrated! New login: ${result.email}`);
                                // Refresh user list
                                await loadUsers();
                              } catch (err) {
                                setMigrateResult('Failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
                              } finally {
                                setMigrating(false);
                              }
                            }}
                            style={{ flex: 1, padding: '8px', background: '#ff9800', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                          >
                            {migrating ? 'Migrating...' : 'Migrate'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="password-note">
                  <p>📝 If user forgot password, they can use <strong>"Forgot Password"</strong> on the login screen (works with Gmail accounts).</p>
                </div>

                <div className="modal-actions" style={{ display: 'flex', gap: '8px' }}>
                  {editing ? (
                    <>
                      <button className="btn-secondary" onClick={() => setEditing(false)} style={{ flex: 1 }}>Cancel</button>
                      <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <Save size={16} /> {saving ? 'Saving...' : 'Save'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn-secondary" onClick={() => setViewUserInfo(null)} style={{ flex: 1 }}>Close</button>
                      <button onClick={() => setEditing(true)} style={{ flex: 1, padding: '10px', background: '#00897B', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <Edit3 size={16} /> Edit
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        };
        return <EditableModal />;
      })()}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header delete-header">
              <Trash2 size={24} />
              <h3>Confirm Delete</h3>
            </div>

            <div className="delete-warning">
              <p>Are you sure you want to delete this user?</p>
              <div className="user-to-delete">
                <strong>{deleteConfirm.name}</strong>
                <span>{deleteConfirm.email}</span>
                <span className={`role-badge ${deleteConfirm.role}`}>{deleteConfirm.role}</span>
              </div>
              <p className="warning-text">
                ⚠️ This action will remove the user from the system. This cannot be undone!
              </p>
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="btn-delete-confirm"
                onClick={() => handleDeleteUser(deleteConfirm)}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
