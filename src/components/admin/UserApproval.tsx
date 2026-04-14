import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { User } from '../../types/index';
import './UserApproval.css';

const UserApproval: React.FC = () => {
  const { pendingUsers, approveUser, rejectUser } = useAuth();

  const handleApprove = (user: User) => {
    approveUser(user.id);
  };

  const handleReject = (user: User) => {
    rejectUser(user.id);
  };

  if (pendingUsers.length === 0) {
    return (
      <div className="user-approval-container">
        <div className="approval-header">
          <h2>User Approvals</h2>
          <p className="subtitle">Manage new user registration requests</p>
        </div>
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p>No pending approval requests</p>
          <p className="empty-subtitle">New user registrations will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-approval-container">
      <div className="approval-header">
        <h2>User Approvals</h2>
        <p className="subtitle">{pendingUsers.length} pending request{pendingUsers.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="pending-users-list">
        {pendingUsers.map((user) => (
          <div key={user.id} className="user-card">
            <div className="user-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="user-info">
              <h3>{user.name || 'No name provided'}</h3>
              <p className="email">{user.email}</p>
              <div className="user-meta">
                <span className={`role-badge ${user.role}`}>{user.role}</span>
                {user.requestedAt && (
                  <span className="request-date">
                    Requested: {new Date(user.requestedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="action-buttons">
              <button
                className="approve-btn"
                onClick={() => handleApprove(user)}
                title="Approve user"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                Approve
              </button>
              <button
                className="reject-btn"
                onClick={() => handleReject(user)}
                title="Reject user"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserApproval;
