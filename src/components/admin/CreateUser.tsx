import React, { useState } from 'react';
import { adminCreateUser } from '../../services/adminService';
import type { UserRole } from '../../types/index';
import { CLASSES, type ClassCode } from '../../data/classes';
import './CreateUser.css';

// Slot used inside the username after "mkp.". For teachers it's the class code (prekg/lkg/ukg).
// For admins it's just "admin". The combined username becomes mkp.{slot}.{firstname}.
type UsernameSlot = ClassCode | 'admin';

interface CreateUserProps {
  onBack: () => void;
}

const CreateUser: React.FC<CreateUserProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    firstName: '',
    slot: 'prekg' as UsernameSlot,
    password: 'Teacher@123',
    phone: '',
    role: 'teacher' as UserRole,
    qualification: '',
    salary: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Build username from slot + firstName. Strips non-alphanumerics and lowercases.
  const cleanFirst = formData.firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const username = cleanFirst
    ? `mkp.${formData.slot}.${cleanFirst}`
    : `mkp.${formData.slot}`;
  const email = `${username}@mayurischool.com`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const next = { ...formData, [e.target.name]: e.target.value };
    // When role flips between teacher/admin/parent, snap the slot to a sensible default
    if (e.target.name === 'role') {
      next.slot = e.target.value === 'admin' ? 'admin' : 'prekg';
    }
    setFormData(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!cleanFirst) {
      setError('Enter a first name for the username.');
      return;
    }

    setLoading(true);

    try {
      // For teachers tied to a class, default assignedClasses to the matching class
      const matchedClass = CLASSES.find(c => c.code === formData.slot);
      const assignedClasses = formData.role === 'teacher' && matchedClass
        ? [matchedClass.id]
        : undefined;

      // Create user with admin service (auto-approved)
      await adminCreateUser({
        email: email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
        qualification: formData.qualification,
        salary: formData.salary ? Number(formData.salary) : undefined,
        assignedClasses,
      });

      setSuccess(true);
      setTimeout(() => {
        onBack();
      }, 3000);
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="create-user-container">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>User Created Successfully!</h2>
          <p>The new {formData.role} "{formData.name}" has been created and approved!</p>
          <div style={{ background: '#fff3cd', padding: '16px', borderRadius: '8px', marginTop: '16px' }}>
            <strong>Login Credentials:</strong><br/>
            Username: {username}<br/>
            Email: {email}<br/>
            Password: {formData.password}<br/>
            <small style={{color: '#666', display: 'block', marginTop: '8px'}}>
              Share these credentials with the user. They can login with just the username.
            </small>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-user-container">
      <div className="create-user-header">
        <h2>Create New User</h2>
        <p className="subtitle">Add teachers, staff, or administrators</p>
      </div>

      <form onSubmit={handleSubmit} className="create-user-form">
        <div className="form-group">
          <label>User Role *</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="form-select"
          >
            <option value="teacher">Teacher</option>
            <option value="admin">Administrator</option>
            <option value="parent">Parent</option>
          </select>
        </div>

        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter full name"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Username *</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: '#666', fontWeight: 600, whiteSpace: 'nowrap' }}>mkp.</span>
            <select
              name="slot"
              value={formData.slot}
              onChange={handleChange}
              className="form-select"
              style={{ maxWidth: '140px' }}
            >
              {formData.role === 'admin' ? (
                <option value="admin">admin</option>
              ) : (
                <>
                  <option value="prekg">prekg</option>
                  <option value="lkg">lkg</option>
                  <option value="ukg">ukg</option>
                </>
              )}
            </select>
            <span style={{ color: '#666' }}>.</span>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="firstname"
              required
              className="form-input"
              style={{ flex: 1 }}
            />
          </div>
          <small className="form-hint">
            Login: <strong>{username}</strong>@mayurischool.com
          </small>
        </div>

        <div className="form-group">
          <label>Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            required
            minLength={6}
            className="form-input"
          />
          <small className="form-hint">Minimum 6 characters</small>
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 XXXXX XXXXX"
            className="form-input"
          />
        </div>

        {formData.role === 'teacher' && (
          <>
            <div className="form-group">
              <label>Qualification</label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                placeholder="e.g., B.Ed, M.A. Child Psychology"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Salary (₹/month)</label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="35000"
                className="form-input"
              />
            </div>
          </>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={onBack}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>

        <div className="form-note">
          <strong>Note:</strong> After creating the user, you'll need to approve them in the
          <strong> User Approvals</strong> section before they can access the system.
        </div>
      </form>
    </div>
  );
};

export default CreateUser;
