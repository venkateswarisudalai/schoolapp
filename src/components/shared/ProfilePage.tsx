import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile } from '../../services/userService';
import {
  ChevronLeft,
  Camera,
  Mail,
  Phone,
  Shield,
  LogOut,
  Edit3,
  Check,
  X,
} from 'lucide-react';
import './ProfilePage.css';

interface ProfilePageProps {
  onBack: () => void;
}

const ProfilePage = ({ onBack }: ProfilePageProps) => {
  const { user, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!user) return null;

  const [showPhotoUrl, setShowPhotoUrl] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState('');

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB.');
      return;
    }

    // Convert to data URL (works without Firebase Storage)
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string;
        await updateUserProfile(user.id, { avatar: dataUrl });
        setUploading(false);
      };
      reader.onerror = () => {
        alert('Failed to read image.');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo.');
      setUploading(false);
    }
  };

  const handlePhotoUrlSave = async () => {
    if (!photoUrlInput.trim().startsWith('http')) {
      alert('Enter a valid image URL');
      return;
    }
    setUploading(true);
    try {
      await updateUserProfile(user.id, { avatar: photoUrlInput.trim() });
      setShowPhotoUrl(false);
      setPhotoUrlInput('');
    } catch (error) {
      alert('Failed to save photo URL.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      alert('Name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      await updateUserProfile(user.id, {
        name: editName.trim(),
        phone: editPhone.trim(),
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditName(user.name);
    setEditPhone(user.phone);
    setIsEditing(false);
  };

  const getRoleBadge = () => {
    switch (user.role) {
      case 'admin': return { label: 'Administrator', color: '#00897B' };
      case 'teacher': return { label: 'Teacher', color: '#3b82f6' };
      case 'parent': return { label: 'Parent', color: '#f59e0b' };
      default: return { label: 'Student', color: '#10b981' };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <div className="content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="page-title">Profile</h2>
        {!isEditing ? (
          <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
            <Edit3 size={18} />
          </button>
        ) : (
          <div className="profile-edit-actions">
            <button className="profile-action-btn save" onClick={handleSave} disabled={saving}>
              <Check size={18} />
            </button>
            <button className="profile-action-btn cancel" onClick={handleCancel}>
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Profile Header Card */}
      <div className="profile-header-card">
        <div className="profile-photo-wrapper">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="profile-photo" />
          ) : (
            <div className="profile-photo-placeholder">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
          <button
            className="profile-photo-edit"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <div className="profile-photo-spinner" />
            ) : (
              <Camera size={16} />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            style={{ display: 'none' }}
          />
        </div>

        {/* Photo URL input option */}
        {showPhotoUrl ? (
          <div style={{ display: 'flex', gap: '6px', marginTop: '8px', width: '100%', maxWidth: '300px' }}>
            <input
              value={photoUrlInput}
              onChange={e => setPhotoUrlInput(e.target.value)}
              placeholder="Paste image URL"
              style={{ flex: 1, padding: '6px 10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px' }}
            />
            <button onClick={handlePhotoUrlSave} disabled={uploading} style={{ padding: '6px 12px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Save</button>
            <button onClick={() => setShowPhotoUrl(false)} style={{ padding: '6px 8px', background: '#f5f5f5', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>X</button>
          </div>
        ) : (
          <button
            onClick={() => setShowPhotoUrl(true)}
            style={{ marginTop: '6px', background: 'none', border: 'none', color: '#00897B', fontSize: '12px', cursor: 'pointer' }}
          >
            Or paste image URL
          </button>
        )}

        {isEditing ? (
          <input
            className="profile-name-input"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Full Name"
            autoFocus
          />
        ) : (
          <h2 className="profile-name">{user.name}</h2>
        )}

        <span className="profile-role-badge" style={{ background: `${roleBadge.color}14`, color: roleBadge.color }}>
          <Shield size={14} />
          {roleBadge.label}
        </span>
      </div>

      {/* Info Section */}
      <div className="profile-section">
        <h3 className="profile-section-title">Contact Information</h3>

        <div className="profile-info-row">
          <div className="profile-info-icon">
            <Mail size={18} />
          </div>
          <div className="profile-info-content">
            <span className="profile-info-label">Email</span>
            <span className="profile-info-value">{user.email}</span>
          </div>
        </div>

        <div className="profile-info-row">
          <div className="profile-info-icon">
            <Phone size={18} />
          </div>
          <div className="profile-info-content">
            <span className="profile-info-label">Phone</span>
            {isEditing ? (
              <input
                className="profile-inline-input"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            ) : (
              <span className="profile-info-value">{user.phone || 'Not provided'}</span>
            )}
          </div>
        </div>
      </div>

      {/* Account Section */}
      <div className="profile-section">
        <h3 className="profile-section-title">Account</h3>

        <div className="profile-info-row">
          <div className="profile-info-icon">
            <Shield size={18} />
          </div>
          <div className="profile-info-content">
            <span className="profile-info-label">Role</span>
            <span className="profile-info-value" style={{ textTransform: 'capitalize' }}>{user.role}</span>
          </div>
        </div>

        <div className="profile-info-row">
          <div className="profile-info-icon" style={{ color: user.approvalStatus === 'approved' ? 'var(--success)' : 'var(--warning)' }}>
            <Check size={18} />
          </div>
          <div className="profile-info-content">
            <span className="profile-info-label">Status</span>
            <span className="profile-info-value" style={{ textTransform: 'capitalize' }}>{user.approvalStatus || 'Approved'}</span>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button className="profile-logout-btn" onClick={logout}>
        <LogOut size={20} />
        <span>Sign Out</span>
      </button>

      <p className="profile-version">Mayuri Kids Villa v1.0</p>
    </div>
  );
};

export default ProfilePage;
