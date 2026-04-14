import { useState } from 'react';
import { ChevronLeft, Plus, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createFeedPost } from '../../services/feedService';
import type { Child } from '../../types/index';
import './FeedPostCreator.css';

interface FeedPostCreatorProps {
  onBack: () => void;
  children: Child[];
}

const categories = [
  { value: 'learning', label: 'Learning', emoji: '📚' },
  { value: 'play', label: 'Play', emoji: '🎮' },
  { value: 'meal', label: 'Meal', emoji: '🍽️' },
  { value: 'art', label: 'Art', emoji: '🎨' },
  { value: 'milestone', label: 'Milestone', emoji: '⭐' },
  { value: 'general', label: 'General', emoji: '📝' },
];

const FeedPostCreator = ({ onBack, children }: FeedPostCreatorProps) => {
  const { user } = useAuth();
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<string>('general');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [taggedChildren, setTaggedChildren] = useState<string[]>([]);
  const [tagAll, setTagAll] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const addPhotoUrl = () => {
    const url = newPhotoUrl.trim();
    if (!url) return;
    if (!url.startsWith('http')) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }
    if (photoUrls.length >= 10) {
      setError('Maximum 10 photos per post');
      return;
    }
    setPhotoUrls(prev => [...prev, url]);
    setNewPhotoUrl('');
    setError('');
  };

  const removePhoto = (index: number) => {
    setPhotoUrls(prev => prev.filter((_, i) => i !== index));
  };

  const toggleChild = (childId: string) => {
    setTaggedChildren(prev =>
      prev.includes(childId) ? prev.filter(id => id !== childId) : [...prev, childId]
    );
    setTagAll(false);
  };

  const handleTagAll = () => {
    if (tagAll) {
      setTaggedChildren([]);
      setTagAll(false);
    } else {
      setTaggedChildren(children.map(c => c.id));
      setTagAll(true);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!caption.trim() && photoUrls.length === 0) {
      setError('Please add a caption or photos');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await createFeedPost({
        teacherId: user.id,
        teacherName: user.name,
        classId: '',
        caption: caption.trim(),
        photoUrls,
        taggedChildIds: taggedChildren,
        category: category as 'learning' | 'play' | 'meal' | 'art' | 'milestone' | 'general',
        createdAt: new Date().toISOString(),
      });

      setSaved(true);
      setTimeout(() => onBack(), 2000);
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="content">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{
            width: '80px', height: '80px',
            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', color: 'white', fontSize: '48px'
          }}>
            ✓
          </div>
          <h2>Post Created!</h2>
          <p>Your update has been shared with parents.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="page-title">Create Post</h2>
      </div>

      <div className="feed-creator-form">
        {/* Photo URLs */}
        <div className="form-group">
          <label className="form-label">Photos (paste image URLs)</label>
          <div className="photo-url-input-row">
            <input
              type="url"
              className="form-input"
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPhotoUrl())}
            />
            <button type="button" className="photo-url-add" onClick={addPhotoUrl}>
              <Plus size={20} />
            </button>
          </div>
          <small style={{ color: '#888', fontSize: '12px' }}>
            Use image links from Google Photos, WhatsApp Web, or any image hosting
          </small>

          {photoUrls.length > 0 && (
            <div className="photo-grid" style={{ marginTop: '12px' }}>
              {photoUrls.map((url, index) => (
                <div className="photo-preview" key={index}>
                  <img src={url} alt={`Photo ${index + 1}`} onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }} />
                  <button className="photo-remove-btn" onClick={() => removePhoto(index)}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Caption */}
        <div className="form-group">
          <label className="form-label">Caption</label>
          <textarea
            className="form-textarea"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What's happening in class today?"
            rows={3}
          />
        </div>

        {/* Category */}
        <div className="form-group">
          <label className="form-label">Category</label>
          <div className="category-selector">
            {categories.map(cat => (
              <button
                key={cat.value}
                type="button"
                className={`category-chip ${category === cat.value ? 'active' : ''}`}
                onClick={() => setCategory(cat.value)}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tag Children */}
        <div className="form-group">
          <label className="form-label">Tag Students</label>
          <div className="tag-children-list">
            <button
              type="button"
              className={`tag-chip ${tagAll ? 'active' : ''}`}
              onClick={handleTagAll}
            >
              <Plus size={14} />
              <span>Tag All</span>
            </button>
            {children.map(child => (
              <button
                key={child.id}
                type="button"
                className={`tag-chip ${taggedChildren.includes(child.id) ? 'active' : ''}`}
                onClick={() => toggleChild(child.id)}
              >
                <span>{child.gender === 'male' ? '👦' : '👧'}</span>
                <span>{child.name}</span>
              </button>
            ))}
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        <button
          className="btn btn-primary btn-block"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? 'Posting...' : 'Share Update'}
        </button>
      </div>
    </div>
  );
};

export default FeedPostCreator;
