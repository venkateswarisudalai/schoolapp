import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createAnnouncement } from '../../services/announcementService';
import { ChevronLeft, Send } from 'lucide-react';
import './CreateAnnouncement.css';

interface CreateAnnouncementProps {
  onBack: () => void;
}

const CreateAnnouncement = ({ onBack }: CreateAnnouncementProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'parents' | 'teachers' | 'class'>('all');
  const [targetClassId, setTargetClassId] = useState('');
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('normal');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('You must be logged in to create announcements');
      return;
    }

    setSending(true);

    try {
      console.log('User object:', user);
      console.log('User ID:', user.id);

      const announcementData: any = {
        title,
        content,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        targetAudience,
        priority,
      };

      // Only add targetClassId if targeting a specific class
      if (targetAudience === 'class' && targetClassId) {
        announcementData.targetClassId = targetClassId;
      }

      console.log('Announcement data to save:', announcementData);

      await createAnnouncement(announcementData);

      setSuccess(true);
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (error) {
      console.error('Error creating announcement:', error);
      if (error instanceof Error) {
        alert(`Failed to send announcement: ${error.message}`);
      } else {
        alert('Failed to send announcement. Please try again.');
      }
    } finally {
      setSending(false);
    }
  };

  if (success) {
    return (
      <div className="content">
        <div className="success-screen">
          <div className="success-icon">✓</div>
          <h2>Announcement Sent!</h2>
          <p>Your announcement has been sent successfully.</p>
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
        <h2 className="page-title">Create Announcement</h2>
      </div>

      <div className="create-announcement-container">
        <form onSubmit={handleSubmit} className="announcement-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter announcement title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Message</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your announcement message..."
              rows={6}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="targetAudience">Send To</label>
            <select
              id="targetAudience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value as 'all' | 'parents' | 'teachers' | 'class')}
            >
              <option value="all">Everyone (Parents & Teachers)</option>
              <option value="parents">Parents Only</option>
              <option value="teachers">Teachers Only</option>
              <option value="class">Specific Class</option>
            </select>
          </div>

          {targetAudience === 'class' && (
            <div className="form-group">
              <label htmlFor="targetClassId">Select Class</label>
              <select
                id="targetClassId"
                value={targetClassId}
                onChange={(e) => setTargetClassId(e.target.value)}
                required
              >
                <option value="">Choose a class</option>
                <option value="class-1">Sunshine Nursery</option>
                <option value="class-2">Rainbow LKG</option>
                <option value="class-3">Star UKG</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'normal' | 'important' | 'urgent')}
            >
              <option value="normal">Normal</option>
              <option value="important">Important</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block send-btn"
            disabled={sending}
          >
            {sending ? (
              'Sending...'
            ) : (
              <>
                <Send size={20} />
                <span>Send Announcement</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAnnouncement;
