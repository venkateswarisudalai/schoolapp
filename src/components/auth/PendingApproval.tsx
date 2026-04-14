import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './PendingApproval.css';

const PendingApproval: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  if (user?.approvalStatus === 'rejected') {
    return (
      <div className="pending-approval-container">
        <div className="pending-approval-card rejected">
          <div className="status-icon rejected">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1>Account Not Approved</h1>
          <p className="user-email">{user.email}</p>
          <p className="message">
            Unfortunately, your account registration has been declined by the administrator.
            If you believe this is an error, please contact the school administration.
          </p>
          <button className="logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pending-approval-container">
      <div className="pending-approval-card">
        <div className="status-icon pending">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
        </div>
        <h1>Approval Pending</h1>
        <p className="user-email">{user?.email}</p>
        <p className="message">
          Thank you for registering! Your account is currently pending approval from the school administrator.
          You will be notified once your account has been approved.
        </p>
        <div className="info-box">
          <p><strong>Name:</strong> {user?.name || 'Not provided'}</p>
          <p><strong>Role requested:</strong> {user?.role}</p>
          <p><strong>Registered:</strong> {user?.requestedAt ? new Date(user.requestedAt).toLocaleDateString() : 'Recently'}</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default PendingApproval;
