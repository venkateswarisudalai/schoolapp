import React, { useState } from 'react';
import { adminCreateUser } from '../../services/adminService';
import type { UserRole } from '../../types/index';
import './CreateUser.css';

interface CreateUserProps {
  onBack: () => void;
}

const CreateUser: React.FC<CreateUserProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: 'Teacher@123',
    phone: '',
    role: 'teacher' as UserRole,
    qualification: '',
    salary: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Build email from username
      const email = `${formData.username}@mayurischool.com`;

      // Create user with admin service (auto-approved)
      await adminCreateUser({
        email: email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
        qualification: formData.qualification,
        salary: formData.salary ? Number(formData.salary) : undefined,
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
    const email = `${formData.username}@mayurischool.com`;

    return (
      <div className="create-user-container">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>User Created Successfully!</h2>
          <p>The new {formData.role} "{formData.name}" has been created and approved!</p>
          <div style={{ background: '#fff3cd', padding: '16px', borderRadius: '8px', marginTop: '16px' }}>
            <strong>Login Credentials:</strong><br/>
            Username: {formData.username}<br/>
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
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="e.g., priya"
            required
            className="form-input"
          />
          <small className="form-hint">
            Login: {formData.username || 'username'}@mayurischool.com
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
